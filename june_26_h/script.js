const promo = new Promise((resolve, reject) => {
  var sucess = false;
  setTimeout(() => {
    sucess = true;
    if (sucess == true) {
      resolve("got sucesss");
    } else {
      reject("got rejected");
    }
  }, 2000);
});
console.log(promo);

// console.log("ajju", typeof promo);
// const addbutton = document
//   .getElementById("newBtn")
//   .addEventListener("click", () => promo);
// console.log(addbutton);
// addbutton.then(()=
// >{}).catch(()=>{})
