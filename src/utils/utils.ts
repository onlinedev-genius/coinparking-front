const validation1 = (origin: string) => {
  //半角英数記号のみ
  var regEx = /^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/;

  if (origin.length > 0 && regEx.test(origin) === true) {
    return true;
  } else {
    return false;
  }
};

const validation2 = (origin: string) => {
  //半角数字のみ
  var regEx = /^[0-9]+$/;

  if (origin.length > 0 && regEx.test(origin) === true) {
    return true;
  } else {
    return false;
  }
};

const validation3 = (origin: string) => {
  //半角英字のみ
  var regEx = /^[a-zA-Z]+$/;

  if (origin.length > 0 && regEx.test(origin) === true) {
    return true;
  } else {
    return false;
  }
};

export { validation1, validation2, validation3 };
