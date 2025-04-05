export default class HttpService {

  public static get<T>(url: URL, jsonResponse: boolean, u: string, p: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      fetch(url.href, HttpService.httpHeadersGet(u, p))
        .then(r => HttpService.processResponse(resolve, reject, r, jsonResponse))
        .catch(e => {
          console.error('HTTP GET request failed:', e)
          reject(e)
        })
    })
  }

  public static post<T>(url: URL, body: string, jsonResponse: boolean, u: string, p: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      fetch(url.href, HttpService.httpHeadersPost(body, u, p))
        .then(r => HttpService.processResponse(resolve, reject, r, jsonResponse))
        .catch(e => {
          console.error('HTTP POST request failed:', e)
          reject(e)
        })
    })
  }

  private static async processResponse<T>(resolve: (value: T) => void, reject: (reason?: any) => void, r: Response, jsonResponse: boolean): Promise<void> {
    try {
      const text = await r.text()
      const trimmedText = text ? text.trim() : ''

      switch (r.status) {
        case 200:
        case 201:
          if (!jsonResponse) {
            resolve(trimmedText as T)
            return
          }

          try {
            const json = JSON.parse(trimmedText)
            resolve(json as T)
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError)
            reject('Invalid JSON response')
          }
          break

        case 401:
          reject('Unauthorized: Invalid credentials')
          break

        case 403:
          reject('Forbidden: Access denied')
          break

        case 404:
          reject('Not Found: The requested resource was not found')
          break

        case 500:
          reject('Server Error: Internal server error occurred')
          break

        default:
          reject(`HTTP Error ${r.status}: ${trimmedText}`)
      }
    } catch (error) {
      console.error('Error processing response:', error)
      reject('Failed to process response')
    }
  }

  private static httpHeadersGet(u: string, p: string) {
    return {
      method: 'GET',
      headers: {
        'mode': 'cors',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${u}:${p}`),
      }
    }
  }

  private static httpHeadersPost(body: string, u: string, p: string) {
    return {
      method: 'POST',
      body: body,
      headers: {
        'mode': 'cors',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${u}:${p}`),
      },
    }
  }
}