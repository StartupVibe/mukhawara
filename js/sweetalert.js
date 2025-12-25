// document.getElementById("Search-icon").addEventListener("click", function () {
//   // نتحقق أولًا إن العرض أقل من 768px (يعني موبايل أو تابلت صغير)
//   if (window.innerWidth <= 768) {
//     Swal.fire({
//       title: "Search 🔎",
//       input: "text",
//       inputPlaceholder: "search...",
//       showCancelButton: true,
//       confirmButtonText: "search",
//       cancelButtonText: "close",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       background: "#f9f9f9",
//       inputAttributes: {
//         autocapitalize: "off",
//       },
//       showLoaderOnConfirm: true,
//       preConfirm: (query) => {
//         if (!query) {
//           Swal.showValidationMessage("Please type something to search for");
//         } else {
//           Swal.fire({
//             icon: "success",
//             title: `Done: "${query}"`,
//             showConfirmButton: false,
//             timer: 2000,
//           });
//         }
//       },
//     });
//   }
// });
