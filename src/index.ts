import express, { Request, Response } from 'express';
import { launch } from 'puppeteer';

const app = express();
app.use(express.json());

interface print {
  site: string,
  name: string
}

app.post('/single', async (req: Request, res: Response) => {
  try {
    const { site, name }: print = req.body;

    validate(site, name);
    await printOut(site, name);

    return res.status(200).send('Print tirada com sucesso.');
  } catch (error) {
    console.error(error.message);
    return res.status(400).send('Falha durante o processo de tirar a print.');
  }
});

app.post('/multiple', async (req: Request, res: Response) => {
  try {
    const data: print[] = req.body;

    for (const values of data) {
      validate(values.site, values.name);
      await printOut(values.site, values.name);
    }

    return res.status(200).send('Todos os prints foram criadas com sucesso.');
  } catch (error) {
    console.error(error.message);
    return res.status(400).send('Falha durante o processo de tirar a print.');
  }
});

function validate (site: string, name: string) {
const validateURL = new RegExp(/^https?:\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#\w*)?$/i);
  if (!validateURL.test(site)) throw new Error ('URL inválida');
  if (!name.length || name.length < 3) throw new Error ('Nome inválido');
}

async function printOut(site: string, name: string) {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto(site, { waitUntil: 'networkidle0' });

    const filePath = __dirname + `/temp/${name}.png`;
    await page.screenshot({ path: filePath, fullPage: true });

    await browser.close();
}

app.listen(3333, () => console.log(`Server is running in port: 3333`));
