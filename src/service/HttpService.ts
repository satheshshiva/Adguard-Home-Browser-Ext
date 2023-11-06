export default class HttpService {

  public static get<T>( url:URL, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, HttpService.httpHeadersGet(u, p))
        .then( (r) => HttpService.processResponse(resolve, reject, r, jsonResponse))
        .catch(e => reject(e));
    });
  }

  public static post<T>( url:URL, body:string, jsonResponse:boolean,u:string, p:string ):Promise<T>{
    return new Promise<T>((resolve,reject) => {
      fetch(url.href, HttpService.httpHeadersPost(body, u, p))
        .then( (r) => HttpService.processResponse(resolve, reject, r, jsonResponse))
        .catch(e => reject(e));
    });
  }

  private static async processResponse<T>(resolve: any, reject:any, r: Response, jsonResponse: boolean){
    let str = await new Response(r.body).text();
    str = str?str.trim():str;
    switch (r.status) {
      case 200:case 201:
        if(!jsonResponse){
          resolve(<T>str);
        }
        try{
          let b = JSON.parse(str);
          resolve(<T>b);
        }catch{
          reject(<T>str);
        }
        break;
      case 403:
        reject("Unauthorized: Please check credentials.")
        break;
      default:
        reject(`HTTP Status: ${r.status}: ${<T>str}`);
    }

  }

  private static httpHeadersGet(u:string, p:string)   {
    return {
      method: "GET",
      headers: {
        "mode": "cors",
        "Content-Type": "application/json",
        "Authorization": 'Basic ' + btoa(`${u}:${p}`),
      }
    }
  }

  private static httpHeadersPost(body:string, u:string, p:string)   {
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