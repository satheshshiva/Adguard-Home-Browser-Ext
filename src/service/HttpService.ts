export default class HttpService {

  public static get<T>( url:URL, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, HttpService.httHeadersGet(u, p)).then(async (r) => {
        let str = await new Response(r.body).text();
        str = str?str.trim():str;
        if(!jsonResponse){
          resolve(<T>str);
        }
        try{
          let b = JSON.parse(str);
          resolve(<T>b);
        }catch{
          reject(<T>str);
        } }).catch(e => {
        reject(e);
      });
    });
  }

  public static post<T>( url:URL, body:string, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, HttpService.httHeadersPost(body, u, p)).then(async (r) => {
        let str = await new Response(r.body).text();
        str = str?str.trim():str;
        if(!jsonResponse){
          resolve(<T>str);
        }
        try{
          let b = JSON.parse(str);
          resolve(<T>b);
        }catch{
          reject(<T>str);
        } }).catch(e => {
        reject(e);
      });
    });
  }


  private static httHeadersGet(u:string, p:string)   {
    return {
      method: "GET",
      headers: {
        "mode": "cors",
        "Content-Type": "application/json",
        "Authorization": 'Basic ' + btoa(`${u}:${p}`),
      }
    }
  }

  private static httHeadersPost(body:string, u:string, p:string)   {
    return {
      method: 'POST',
      body: body,
      headers: {
        "mode": "cors",
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${u}:${p}`),
      },
    }
  }
}