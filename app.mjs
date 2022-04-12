import express from "express";
import cors from "cors";
import autoScroll from "./helpers/AutoScroll.mjs";
// import { chromium } from "playwright";
import { firefox } from "playwright-firefox";
import firestore from "./firebase/firebaseConfig.js";
import { doc, setDoc } from "@firebase/firestore";
import formatPrice from "./helpers/formatPrice.mjs";
import formatCityName from "./helpers/formatCityName.mjs";
import formatDate from "./helpers/formatDate.mjs";
import formatPriceJumbo from "./helpers/formatPriceJumbo.js";
const app = express();
const { db } = firestore;
app.use(
  cors({
    origin: "*",
  })
);
//
app.get("/extraerLista", (req, res) => {
  (async () => {
    const browser = await chromium.launch({ slowMo: 250 });
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
    await autoScroll(page);
    const sections = await page.locator(".container > section");

    const countSections = await sections.count();
    for (let s = 1; s < countSections; s++) {
      let section = await sections.nth(s);
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
        let formatedPrice = formatPrice(price)

        await setDoc(doc(db, "merqueo", ciudad, "Precios", shortName), {
          id: i,
          img,
          name,
          weight,
          formatedPrice,
          brand: "merqueo",
        })
          .then((resp) => {
            console.log("Guardado con exito");
          })
          .catch((error) => {
            console.log("error", error);
          });
      }
    }
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
    const browser = await firefox.launch({ slowMo: 450 });

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
      await innerPage.waitForSelector(".container > section");
      await autoScroll(innerPage);
      const sections = await innerPage.locator(".container > section");
      const countSections = await sections.count();     
      console.log('countSections', countSections) 
      for (let s = 1; s < countSections; s++) {
        let section = await sections.nth(s);                
        await innerPage.waitForSelector(".mq-grid-products > article", {
          timeout: 0,
        });
        const innerRows = await innerPage.locator(".mq-grid-products");
        let each1 = innerRows.locator(".mq-product-card");
        let counts = await each1.count();
    

        for (let i = 0; i < counts; i++) {
          let each = each1.nth(i);
          // await each.scrollIntoViewIfNeeded({ timeout: 0 });
          await each.isVisible({ timeout: 0 });
          let img = await each.locator(".mq-img").getAttribute("src");
          let name = await each.locator(".mq-product-title").innerText();        
          let weight = await each.locator(".mq-product-subtitle").innerText();
          let date = new Date();
          date = formatDate(date)
          name = name.replace(/\//g, "-");
          let price = await each.locator(".mq-product-price").innerText();
        
          // price to number
          let formatedPrice = formatPrice(price)

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
              price: formatedPrice,
              brand: "merqueo",
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

  })();
  console.log("Connected to React");
 
});
app.get("/getCornerShop/:id", (req, res) => {
  (async () => {
    console.log('Creando browser')
    const browser = await firefox.launch({slowMo: 450 });

    console.log('Iniciando page')
    const page = await browser.newPage();
    console.log('despues page')
    
    //req params
    console.log('Iniciando page')
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
      ".shopping-list-selector-control",
      {
        timeout:0,
      }
    );
    await page.waitForSelector(
      "#app-container > header > div.cart-address-selector-control-container"
    );
    await page.click(
      "#app-container > header > div.cart-address-selector-control-container"
    );
    await page.waitForSelector(
      ".form-select"
    );
    await page.waitForSelector(
      "#city-country",
      {
        timeout:0,
      }
    );
    await page.click('#city-country')
    await page.waitForSelector('[data-testid="city-select"]');
    const firstRows = await page.locator(
      '[data-testid="city-select"] > option'
    );
    let cityPageName;
    let count = await firstRows.count();
    console.log("Ciudades", count);
    let id = req.params.id;
    for (let i = id; i < count; i++) {
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

      for (let i = 0; i < categorias; i++) {
        let each = rows.nth(i);
        await each.scrollIntoViewIfNeeded({ timeout: 0 });
        await each.isVisible({ timeout: 0 });
        page.locator(".department-box card");
        let name = await each.locator("h2 > span").textContent();
        console.log("name", name);
        // if (name !== "Fruits & Vegetables") {
        //   continue;
        // } else {
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
            // if (name !== "Fresh Vegetables") {
            //   continue;
            // } else {
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
             
              for (let z = 0; z < countProducts; z++) {
                
                let product = await products.nth(z);
                await product.scrollIntoViewIfNeeded({ timeout: 0 });
                await product.isVisible({ timeout: 0 });
              //Is product in stock
                let isOutOfStock = await product.locator('.out-of-stock-badge').allTextContents()                
                if(isOutOfStock[0] === 'Out of stock'){
                  console.log('No stock, sorry 😢')
                  break
                }
                  
                let name = await product
                  .locator(".product-content > .product-info > h3")
                  .textContent();
               let price = await product
                  .locator(".product-content > .product-info > .price")
                  .textContent();
               let formatedPrice = formatPriceJumbo(price)
                let image = await product
                  .locator(".product-img > div > img")
                  .getAttribute("src");
                cityPageName = formatCityName(cityPageName)
                let date = new Date();
                date = formatDate(date)
                
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
                    price: formatedPrice,
                    brand: "cornershop",
                  }
                )
                  .then((res) => {
                    console.log("exito");
                  })
                  .catch((err) => {
                    console.log("error", err);
                  });
    
              }
            // }
          // }        
        }
      }
    }
  })();
  console.log("Connected, retrieving data from CornerShop");
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

    const rows = await page.locator(".vtex-search-result-3-x-galleryItem");
    const categorias = await rows.count();
    for (let i = 0; i < categorias; i++) {
      const each = rows.nth(i);
      const url = await each.locator("a").getAttribute("href");
      const completeUrl = `https://www.olimpica.com${url}`;
      const name = await each
        .locator(".vtex-product-summary-2-x-productNameContainer")
        .textContent();
      console.log(name);
      let pagePromise = page
        .context()
        .waitForEvent("page", (p) => p.url() === completeUrl);

      await page.click(`text=${name}`, { modifiers: ["Control"] });
      const newPage = await pagePromise;
      await newPage.bringToFront();
      await newPage.waitForSelector(".vtex-store-components-3-x-container");
      const img = await newPage
        .locator(".vtex-store-components-3-x-productImageTag")
        .getAttribute("src");
      const buttons = await newPage.locator(
        ".vtex-store-components-3-x-skuSelectorItem"
      );
      const countButtons = await buttons.count();
      for (let i = 0; i < countButtons; i++) {
        const innerEach = buttons.nth(i);
        const innerName = await innerEach
          .locator(
            ".vtex-store-components-3-x-skuSelectorItemTextValue--sku-selector"
          )
          .textContent();
        await newPage.locator(
          "vtex-rich-text-0-x-wrapper--btn-trigger-location"
        );

        await innerEach.click(`text=${innerName}`);
        await newPage.waitForSelector(
          ".vtex-rich-text-0-x-wrapper--btn-trigger-location",
          { timeout: 0 }
        );

        const newPrice = await newPage
          .locator(
            "body > div.render-container.render-route-store-product > div > div.vtex-store__template.bg-base > div > div > div > div:nth-child(8) > div > div:nth-child(1) > div.vtex-flex-layout-0-x-flexRow.vtex-flex-layout-0-x-flexRow--product-container > section > div > div.pr0.items-stretch.vtex-flex-layout-0-x-stretchChildrenWidth.flex > div > div.vtex-flex-layout-0-x-flexColChild.vtex-flex-layout-0-x-flexColChild--pr-ol-rigth-col.pb7 > div > div:nth-child(4) > div > div.olimpica-dinamic-flags-0-x-strikePrice.false > span > span:nth-child(3)"
          )
          .textContent();

        console.log("innerName, innerPrice", innerName, newPrice);
      }

      // const price = await each.locator('.olimpica-dinamic-flags-0-x-currencyInteger').textContent()
      // console.log(price)
      // const image = await each.locator('.vtex-product-summary-2-x-imageNormal').getAttribute('src')
      // console.log(image)
    }

    console.log("categorias", categorias);
  })();
  console.log("A por olimpica");
});

app.get("/", (req, res) => {
  res.send("hola mundo");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
