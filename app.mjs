import express, { json } from "express";
import cors from "cors";

import https from "https";

import fs from "fs";
const app = express();
import { chromium, firefox } from "playwright";

import firestore from "./firebase/firebaseConfig.js";
import { collection, doc, setDoc, addDoc, getDocs } from "@firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
const { db } = firestore;
const storage = getStorage();
app.use(
  cors({
    origin: "*",
  })
);
//
app.get("/extraerLista", (req, res) => {
  (async () => {
    // iterate through the array

    // get the current item

    // get the current item's index

    const browser = await chromium.launch({ headless: false, slowMo: 250 });
    const page = await browser.newPage();
    await page.goto(
      `https://merqueo.com/bogota/super-ahorro/frutas-y-verduras`,
      {
        waitUntil: "load",
        // Remove the timeout
        timeout: 0,
      }
    );
    await page.waitForSelector(".mq-grid-products > article", {
      timeout: 40000,
    });
 await autoScroll(page)
    const sections = await page.locator('.container > section')
    
    const countSections = await sections.count()
    for(let s = 1; s < countSections; s++){
      let section = await sections.nth(s)
      const rows = await section.locator(".mq-grid-products");

      let arrayData = [];
      // for (let i = 0; i < count; i++) {
  
      let each1 = rows.locator(".mq-product-card");
      let counts = await each1.count();
      let initialData = new Date();
      arrayData.push(initialData);
      let name;
      // each = await each.elementHandle('.mq-img').getAttribute('src')
      // console.log('each', each)
  
      for (let i = 0; i < counts; i++) {
        let each = each1.nth(i);
        await each.scrollIntoViewIfNeeded({ timeout: 0 });
        await each.isVisible({ timeout: 0 });
  
        let img = await each.locator(".mq-img").getAttribute("src");
  
        name = await each.locator(".mq-product-title").innerText();
        let shortName =
          name.split(" ")[0] +
          " " +
          name.split(" ")[1] +
          " " +
          name.split(" ")[2];
        let weight = await each.locator(".mq-product-subtitle").innerText();
  
        let price = await each.locator(".mq-product-price").innerText();
        let price2 = price.replace("$", "");
        let price3 = price2.replace(".", "");
        // price to number
        let price4 = parseInt(price3);
  
        // arrayData.push({name : name.split(' ')[0]})
        // arrayData.push( {  id: i, img, name, weight, price });
        await setDoc(doc(db, "merqueo", ciudad, "Precios", shortName), {
          id: i,
          img,
          name,
          weight,
          price4,
          brand: 'merqueo'
        })
          .then((resp) => {
            console.log("Guardado con exito");
          })
          .catch((error) => {
            console.log("error", error);
          });
      }


    }

    

    

    // addDoc(collection(db, "dataprecios"), {...arrayData })
    //   .then((resp) => {
    //     console.log("Guardado con exito");
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    await page.close();

    await browser.close();
  })();

  console.log("Cargando productos");
});
app.get("/lista", (req, res) => {
  (async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 250 });
    const page = await browser.newPage();
    await page.goto(`https://merqueo.com`, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    await page.click("#mq-country-header > div");
    await page.waitForSelector("#section-country");
    await page.click(
      "#section-country > div:nth-child(2) > div.section-country-item.first.selected"
    );
    await page.waitForSelector("#section-country");
    await page.waitForSelector("#section-country > div.section-country-header");
    await page.waitForSelector(
      "#section-country > div.section-country__cities"
    );
    const rows = await page.locator(
      "#section-country > div.section-country__cities > a.section-country__cities__item"
    );
    let countRows = await rows.count();
    let arrayData = [];
    for (let i = 0; i < countRows; i++) {
      let each = rows.nth(i);
      let ciudad = await each.innerText();
      arrayData.push(ciudad);
      await setDoc(doc(db, `lista/${ciudad}`), { ciudad });
      console.log("Guardado con exito");
    }
    await page.close();
    await browser.close();
  })();
  console.log("Cargando ciudades");
});
app.get("/listaCiudades", (req, res) => {
  (async () => {
    const browser = await chromium.launch({ slowMo: 350 });
    const page = await browser.newPage();
    await page.goto(`https://merqueo.com`, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    await page.click("#mq-country-header > div");
    await page.waitForSelector("#section-country");
    await page.click(
      "#section-country > div:nth-child(2) > div.section-country-item.first.selected"
    );
    await page.waitForSelector("#section-country");
    await page.waitForSelector("#section-country > div.section-country-header");
    await page.waitForSelector(
      "#section-country > div.section-country__cities"
    );
    const rows = await page.locator(
      "#section-country > div.section-country__cities > a.section-country__cities__item"
    );
    console.log("rows count ", await rows.count());
    let arrayData = [];
    for (let i = 0; i < (await rows.count()); i++) {
      let cityPageName = await rows.nth(i).getAttribute("href");
      let indexSign = cityPageName.indexOf("=");
      cityPageName = cityPageName.slice(indexSign + 1);
      let city = await rows.nth(i).first("p").innerText();
      console.log("path, city", cityPageName, city);
      if (
        cityPageName === "bucaramanga" ||
        cityPageName === "copacabana" ||
        cityPageName === "floridablanca"
        
      ) {
        continue;
      }
      const innerPage = await browser.newPage();
      await innerPage.goto(
        `https://merqueo.com/${cityPageName}/super-ahorro/frutas-y-verduras`,
        {
          waitUntil: "load",
          // Remove the timeout
          timeout: 0,
        }
      );
      await innerPage.waitForSelector('.container > section')
       
      await autoScroll(innerPage)
      const sections = await innerPage.locator('.container > section')
      
      const countSections = await sections.count()
      console.log("sections", countSections)
      for(let s = 1; s < countSections; s++){
        
        let section = await sections.nth(s)
       console.log(await section.getAttribute('id'))
        const rows = await section.locator(".mq-grid-products");
      await innerPage.waitForSelector(".mq-grid-products > article", {
        timeout: 30000,
      });
      const innerRows = await innerPage.locator(".mq-grid-products");

      let arrayData = [];
      // for (let i = 0; i < count; i++) {

      let each1 = innerRows.locator(".mq-product-card");
      let counts = await each1.count();
      let initialData = new Date();
      arrayData.push(initialData);
      let name;
      // each = await each.elementHandle('.mq-img').getAttribute('src')
      // console.log('each', each)

      for (let i = 0; i < counts; i++) {
        let each = each1.nth(i);
        // await each.scrollIntoViewIfNeeded({ timeout: 0 });
        await each.isVisible({ timeout: 0 });

        let img = await each.locator(".mq-img").getAttribute("src");

        name = await each.locator(".mq-product-title").innerText();
        const lengthName = name.split(" ").length;
        let shortName;
        if (lengthName > 3) {
          shortName =
            name.split(" ")[0] +
            " " +
            name.split(" ")[1] +
            " " +
            name.split(" ")[2];
        } else if (lengthName > 2) {
          shortName = name.split(" ")[0] + " " + name.split(" ")[1];
          shortName = shortName.toLowerCase();
        } else {
          shortName = name.split(" ")[0];
        }

        let weight = await each.locator(".mq-product-subtitle").innerText();
        let date = new Date();
        date = date.toLocaleDateString();
        let splitdate = date.split("/");

        let day = splitdate[1];
        date = date.replace(/\//g, "-");
        name = name.replace(/\//g, "-");
        let price = await each.locator(".mq-product-price").innerText();
        let price2 = price.replace("$", "");
        let price3 = price2.replace(".", "");
        // price to number
        let price4 = parseInt(price3);

        await setDoc(
          doc(
            db,
            "merqueo",
            cityPageName,
            "Historico",
            name,
            "preciosDiarios",
            date
          ),
          {
            date,
            price: price4,
            brand: 'merqueo'
          }
        )
          .then((resp) => {
            console.log("Guardado el precio actual con exito");
          })
          .catch((error) => {
            console.log("error", error);
          });
        // await setDoc(doc(db, "merqueo", cityPageName, "Precios", name), {
        //   id: i,
        //   name,
        //   price: price4,
        //   weight,
        //   img,
        //   date,
        // })
        //   .then((resp) => {
        //     console.log("Guardado con exito");
        //   })
        //   .catch((error) => {
        //     console.log("error", error);
        //   });
      }
    }

      await innerPage.close();
    }
    await page.close();

    await browser.close();
    //     let texts = await cell.allInnerTexts();
    //
    //     let arrayData = [];
    //
    //     texts.forEach((element) => {
    //       const cleanElement = element.split("\n");
    //       cleanElement.forEach((element) => {
    //         if (element.length > 2) {
    //           console.log("element", element);
    //           arrayData.push(element);
    //         }
    //       });
    //     });
    // addDoc(collection(db, "ciudades"), { ...arrayData })
    //   .then((resp) => {
    //     console.log("Guardado con exito");
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    // res.send(JSON.stringify(arrayData));
  })();
  console.log("Connected to React");
  // send arrayData as response
});
app.get("/getCornerShop", (req, res) => {
  (async () => {
    const browser = await firefox.launch({headless:false, slowMo: 800 });
    const page = await browser.newPage();
    await page.goto(`https://web.cornershopapp.com/`, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    await page.waitForSelector(
      "#modal-container > div.cs-dialog.welcome-dialog.modal > div > div > div > div.welcome-footer-container > div > button.continue-button.primary.full-width.cs-button.button"
    );
    await page.click(
      "#modal-container > div.cs-dialog.welcome-dialog.modal > div > div > div > div.welcome-footer-container > div > button.continue-button.primary.full-width.cs-button.button"
    );
    await page.waitForSelector(
      "#app-container > main > div > section:nth-child(1) > section > div > figure:nth-child(1) > div > figure:nth-child(1)",
      {
        timeout: 0,
      }
    );
    await page.waitForSelector(
      "#app-container > header > div.cart-address-selector-control-container"
    );
    await page.click(
      "#app-container > header > div.cart-address-selector-control-container"
    );
    await page.waitForSelector(
      "#modal-container > div.cs-dialog.location-selector-dialog.modal > div > div.cs-modal-children-wrapper > div > div > form > section.city-locality-form-group.form-group.collection-view.grid-column.width-12 > div > div > div > div > div:nth-child(1)"
    );
    await page.waitForSelector(
      "#modal-container > div.cs-dialog.location-selector-dialog.modal > div > div.cs-modal-children-wrapper > div > div > form > section.city-locality-form-group.form-group.collection-view.grid-column.width-12 > div > div > div > div > div:nth-child(1) > div"
    );
    await page.waitForSelector('[data-testid="city-select"]');
    const firstRows = await page.locator(
      '[data-testid="city-select"] > option'
    );
    let cityPageName;
    let count = await firstRows.count();
    console.log("Ciudades", count);
    for (let i = 6; i < count; i++) {
      await page.goto(`https://web.cornershopapp.com/location-selector`, {
        waitUntil: "load",
        // Remove the timeout
        timeout: 0,
      });
      await page.waitForSelector("div.location-selector-container");
      await page.waitForSelector("select[data-testid='city-select']");
      const firstRows = await page.locator(
        '[data-testid="city-select"] > option'
      );

      let each = firstRows.nth(i);
      cityPageName = await each.innerText();
      console.log("cityPageName", cityPageName);
      await page.waitForSelector('[data-testid="action-button"]');
      const citys = await page.locator("select[data-testid='city-select']");
      // handle dropdown menu
      await citys?.selectOption(cityPageName);

      await page.waitForSelector('[data-testid="action-button"]');
      await page.click('[data-testid="action-button"]');
      await page.waitForSelector(
        "#app-container > header > div.cart-address-selector-control-container"
      );

      await page.goto(`https://web.cornershopapp.com/`, {
        waitUntil: "load",
        // Remove the timeout
        timeout: 0,
      });
      await page.waitForSelector("//span[text()='Jumbo. ']");

      await page.click("//span[text()='Jumbo. ']");

      await page.waitForSelector(
        "#app-container > main > div > div > section.department-top-products"
      );
      await page.waitForSelector(
        "#app-container > main > div > div > section.department-top-products > div > div"
      );
      const rows = await page.locator(
        "#app-container > main > div > div > section.department-top-products > div > div"
      );
      const categorias = await rows.count();
      console.log("categorias", categorias);

      for (let i = 0; i < count; i++) {
        let each = await rows.nth(i);
        await each.scrollIntoViewIfNeeded({ timeout: 0 });
        await each.isVisible({ timeout: 0 });
        await page.locator(".department-box card");
        let name = await each.locator("h2 > span").textContent();
        console.log("name", name);
        if (name !== "Fruits & Vegetables") {
          continue;
        } else {
          await page.click(
            "#app-container > main > div > div > section.department-top-products > div > div:nth-child(1) > div.img-background.card-header > button"
          );
          await page.waitForSelector("#app-container > main > div > div");
          await page.waitForSelector(
            "#app-container > main > div > div > div:nth-child(6)"
          );

          const cells = await page.locator(".aisle-box");

          const countCells = await cells.count();
          console.log("countCells", countCells);
          for (let y = 0; y < countCells; y++) {
            let cell = await cells.nth(y);
            await cell.scrollIntoViewIfNeeded({ timeout: 0 });
            await cell.isVisible({ timeout: 0 });
            await each.locator(".department-box card");
            let name = await cell.locator("h2 > span").textContent();
            if (name !== "Fresh Vegetables") {
              continue;
            } else {
              await page.click(
                "#app-container > main > div > div > div:nth-child(5) > div.clickable.card-header"
              );
              await page.waitForSelector(
                "#app-container > main > div > div > div.aisle-box.card > div.products-grid"
              );
              const products = await page.locator(
                "#app-container > main > div > div > div.aisle-box.card > div.products-grid > div"
              );
              const countProducts = await products.count();
              console.log("countProducts", countProducts);
              for (let z = 1; z < countProducts; z++) {
                let product = await products.nth(z);
                await product.scrollIntoViewIfNeeded({ timeout: 0 });
                await product.isVisible({ timeout: 0 });

                let name = await product
                  .locator(".product-content > .product-info > h3")
                  .textContent();
                //remove spaces name
                let nameWithoutSpaces = name.replace(/\s/g, "");

                let price = await product
                  .locator(".product-content > .product-info > .price")
                  .textContent();
                price = price.replace(/(\COP)/g, "");
                price = price.replace(/(\$)/g, "");
                price = price.replace(/(\,)/g, "");
                price = parseInt(price);

                let image = await product
                  .locator(".product-img > div > img")
                  .getAttribute("src");

                // let weight = await product
                //   .locator(".product-content > .product-info > .package")
                //   .textContent();
                cityPageName = cityPageName
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "");
                cityPageName = cityPageName.toLowerCase();
                let date = new Date();
                date = date.toLocaleDateString();
                let splitdate = date.split("/");

                let day = splitdate[1];
                date = date.replace(/\//g, "-");

                await setDoc(
                  doc(
                    db,
                    "cornershop",
                    cityPageName,
                    "Historico",
                    name,
                    "preciosDiarios",
                    date
                  ),
                  {
                    date,
                    price,
                    brand:'cornershop'
                  }
                )
                  .then((res) => {
                    console.log("exito");
                  })
                  .catch((err) => {
                    console.log("error", err);
                  });

                // await setDoc(
                //   doc(db, "cornershop", cityPageName, "precios-jumbo", name),
                //   {
                //     name,
                //     img : image,
                //     price,
                //     weight,
                //     date,
                //   }
                // )
                //   .then((resp) => {
                //     console.log("Guardado con exito");
                //   })
                //   .catch((error) => {
                //     console.log(error);
                //   });
              }
            }
          }
          console.log(name);
        }
      }
    }
  })();
  console.log("Connected to React");
});

app.get("/getOlimpica", async (req, res) => {
  (async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();
    await page.goto(
      "https://www.olimpica.com/supermercado/frutas-y-verduras?map=category-1",
      {
        waitUntil: "load",
        // Remove the timeout
        timeout: 0,
      }
    );
    await page.waitForSelector('//*[@id="gallery-layout-container"]');
    
    // await autoScroll(page)
    
    const rows = await page.locator('.vtex-search-result-3-x-galleryItem')
    const categorias = await rows.count();
    for(let i = 0; i < categorias; i++){
const each = rows.nth(i)
const url = await each.locator('a').getAttribute('href')
const completeUrl = `https://www.olimpica.com${url}`
const name = await each.locator('.vtex-product-summary-2-x-productNameContainer').textContent()
console.log(name)
let pagePromise = page.context().waitForEvent('page',p => p.url() === completeUrl)

await page.click(`text=${name}`,{modifiers: ['Control']})
const newPage = await pagePromise
await newPage.bringToFront()
await newPage.waitForSelector('.vtex-store-components-3-x-container')
const img = await newPage.locator('.vtex-store-components-3-x-productImageTag').getAttribute('src')
const buttons = await newPage.locator('.vtex-store-components-3-x-skuSelectorItem')
const countButtons = await buttons.count()
for(let i = 0; i < countButtons; i++){
  const innerEach = buttons.nth(i)
  const innerName = await innerEach.locator('.vtex-store-components-3-x-skuSelectorItemTextValue--sku-selector').textContent()
  await newPage.locator('vtex-rich-text-0-x-wrapper--btn-trigger-location')


  await innerEach.click(`text=${innerName}`)
 await newPage.waitForSelector('.vtex-rich-text-0-x-wrapper--btn-trigger-location',{timeout:0})
  
  const newPrice = await newPage.locator('body > div.render-container.render-route-store-product > div > div.vtex-store__template.bg-base > div > div > div > div:nth-child(8) > div > div:nth-child(1) > div.vtex-flex-layout-0-x-flexRow.vtex-flex-layout-0-x-flexRow--product-container > section > div > div.pr0.items-stretch.vtex-flex-layout-0-x-stretchChildrenWidth.flex > div > div.vtex-flex-layout-0-x-flexColChild.vtex-flex-layout-0-x-flexColChild--pr-ol-rigth-col.pb7 > div > div:nth-child(4) > div > div.olimpica-dinamic-flags-0-x-strikePrice.false > span > span:nth-child(3)').textContent()

  console.log('innerName, innerPrice', innerName, newPrice)


}



// const price = await each.locator('.olimpica-dinamic-flags-0-x-currencyInteger').textContent()
// console.log(price)
// const image = await each.locator('.vtex-product-summary-2-x-imageNormal').getAttribute('src')
// console.log(image)



    }
    
    console.log("categorias", categorias);

   
  })()
  console.log('A por olimpica')
});

app.get("/uploadImages", (req, res) => {
  (async () => {
    const querySnapshot = await getDocs(
      collection(db, `cornershop/bogota/precios-jumbo`)
    );
    let productos = [];
    querySnapshot.forEach((doc) => {
      productos.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    for (let i = 0; i < productos.length; i++) {
      let { image, name } = productos[i].data;

      let nameWithoutSpaces = name.replace(/\s/g, "");

      const file = fs.createWriteStream(`${nameWithoutSpaces}.jpg`);

      https
        .get(image, (resp) => {
          resp.pipe(file);
        })
        .on("error", (err) => {
          console.log("Error: " + err.message);
        });
      const metadata = {
        contentType: "image/jpeg",
      };
      const localFile = fs.createReadStream(`${nameWithoutSpaces}.jpg`);

      let imageRef = ref(storage, `fotosJumbo/${nameWithoutSpaces}`);
      let uploadedUrl;

      // Uploads a local file to the bucket
      //     await storage.bucket("recetapp-b9a54.appspot.com/fotosJumbo").upload(`${nameWithoutSpaces}.jpg`, {
      //         // Support for HTTP requests made with `Accept-Encoding: gzip`
      //         gzip: true,
      //         // By setting the option `destination`, you can change the name of the
      //         // object you are uploading to a bucket.
      //         metadata: {
      //             // Enable long-lived HTTP caching headers
      //             // Use only if the contents of the file will never change
      //             // (If the contents will change, use cacheControl: 'no-cache')
      //             cacheControl: 'public, max-age=31536000',
      //         },
      // });

      //       const uploadTask = uploadBytes(imageRef, `${nameWithoutSpaces}.jpg`, metadata);
      //       uploadTask.on(
      //         "state_changed",
      //         (snapshot) => {
      //           switch (snapshot.state) {
      //             case "paused":
      //               console.log("Upload is paused");
      //               break;
      //             case "running":
      //               console.log("Upload is running");
      //               break;
      //           }
      //         },
      //         (error) => {
      //           // Handle unsuccessful uploads
      //           console.log(error, 'error')
      //         },
      //         () => {
      //           getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      //             uploadedUrl = downloadURL;
      //             console.log("File available at", downloadURL);
      //           });
      //           setDoc(
      //             doc(db, "cornershop", 'bogota', "precios-jumbo", name),
      //             {
      //
      //               image:uploadedUrl,
      //
      //             }
      //           )
      //             .then((resp) => {
      //               console.log("Guardado con exito");
      //             })
      //             .catch((error) => {
      //               console.log(error);
      //             });
      //
      //         }
      //       );
    }
  })();
  console.log("Entrando a subir imagenes");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 350);
      });
  });
}