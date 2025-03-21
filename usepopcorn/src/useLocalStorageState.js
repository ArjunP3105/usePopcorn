import { useEffect, useState } from "react";
export function useLocalStorageState(initalstate, key) {
  const [value, setvalue] = useState(function () {
    const storage = localStorage.getItem(key);
    return storage ? JSON.parse(storage) : initalstate;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key, value]
  );
  return [value, setvalue];
}
