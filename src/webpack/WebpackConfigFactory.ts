import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ZipPlugin from 'zip-webpack-plugin'
import * as path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import ESLintWebpackPlugin from 'eslint-webpack-plugin'

export class WebpackConfigFactory {
  public static createConfig(
    browser: Browsers,
    isProduction: boolean
  ): Configuration {
    let config: Configuration = {
      mode: isProduction ? 'production' : 'development',
      entry: {
        popup: path.join(__dirname, '../', 'module/popup', 'popup.ts'),
        options: path.join(__dirname, '../', 'module/option', 'options.ts'),
        background: path.join(
          __dirname,
          '../',
          'module/background',
          'background.ts'
        )
      },
      devtool: isProduction ? false : 'inline-source-map',
      output: {
        path: path.join(__dirname, '../../dist/' + browser),
        filename: '[name].js'
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                isCustomElement: (tag: string): boolean => tag.startsWith('v-')
              }
            }
          },
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
                target: 'esnext',
                jsx: 'preserve'
              }
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.s[ac]ss$/i,
            use: ['style-loader', 'css-loader', 'sass-loader']
          },
          {
            test: /\.(woff|woff2|ttf|eot)$/,
            type: 'asset/resource'
          }
        ]
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
        alias: {
          vue: '@vue/runtime-dom',
          '@': path.resolve(__dirname, '../')
        }
      },
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        }
      },
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'manifest.' + browser + '.json',
              to: 'manifest.json'
            },
            {
              from: '_locales',
              to: '_locales'
            },
            {
              from: 'icon',
              to: 'icon'
            }
          ]
        }),
        new HtmlWebpackPlugin({
          template: path.join(__dirname, '../', 'module/popup', 'popup.html'),
          filename: 'popup.html',
          chunks: ['popup']
        }),
        new HtmlWebpackPlugin({
          template: path.join(
            __dirname,
            '../',
            'module/option',
            'options.html'
          ),
          filename: 'options.html',
          chunks: ['options']
        }),
        new HtmlWebpackPlugin({
          template: path.join(
            __dirname,
            '../',
            'module/background',
            'background.html'
          ),
          filename: 'background.html',
          chunks: ['background']
        }),
        new VueLoaderPlugin(),
        new ESLintWebpackPlugin({
          extensions: ['ts', 'vue'],
          failOnError: isProduction,
          failOnWarning: isProduction
        })
      ]
    }

    if (isProduction) {
      if (config.plugins) {
        const zip_options = {
          filename: 'package.' + browser + '.zip',
          path: path.join(__dirname, '../../')
        }
        // @ts-ignore - Ignore type mismatch between ZipPlugin and webpack types
        config.plugins.push(new ZipPlugin(zip_options))
      }
    }

    return config
  }
}

export interface CliConfigOptions {
  config?: string
  mode?: Configuration['mode']
  env?: string
  'config-register'?: string
  configRegister?: string
  'config-name'?: string
  configName?: string
}

export enum Browsers {
  Chrome = 'chrome',
  Firefox = 'firefox'
}
