import { useEffect } from "react";
export function useKey(Action, KEY) {
  useEffect(function () {
    function Press(event) {
      if (event.code.toLowerCase() === KEY.toLowerCase()) Action();
    }
    document.addEventListener("keydown", Press);

    return function () {
      document.removeEventListener("keydown", Press);
    };
  });
}
