import { Platform, CircleCollider, Body, Point } from "./world";
import Vector from "./vector";

let markers = new Map<new () => any, string>();
let revivers = new Map<string, (obj: any) => {}>();

function addReviver(marker: string, constructor: new () => any) {  
  revivers.set(marker, (obj: any) => {
    let newObj = new constructor();

    for(let key in obj) {
      newObj[key] = obj[key];
    }

    return newObj;
  });
}

export function setupSerialization(marker: string, constructor: any) {
  markers.set(constructor, marker);
  
  addReviver(marker, constructor); 
}

setupSerialization("vector", Vector);
setupSerialization("platform", Platform);
setupSerialization("circleCollider", CircleCollider);
setupSerialization("body", Body);
setupSerialization("point", Point);

export function serialize(obj: Object) {
  function addMarker(obj: any) {
    for(let key in obj) {
      let value = obj[key];
      
      if(typeof value === "object" && value != null) {
        addMarker(value);
      }

      obj._marker = markers.get(obj.constructor);
    }
  }

  addMarker(obj);

  return JSON.stringify(obj);
}

export function deserialize(jsonString: string) {
  let rawObj = JSON.parse(jsonString);

  function reviveObj(obj: any) {
    for(let key in obj) {
      let value = obj[key];

      if(typeof value === "object" && value != null) {
        obj[key] = reviveObj(value);
      }
    }

    let marker = obj._marker;
    let reviver = revivers.get(marker);

    if(reviver) {
      return reviver(obj); 
    } 
    else {
      return obj;
    }
  }

  return reviveObj(rawObj);
}