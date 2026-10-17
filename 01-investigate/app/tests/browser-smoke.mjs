import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {extname, resolve} from 'node:path';
const {chromium,expect}=await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
const root=fileURLToPath(new URL('../../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.md':'text/markdown; charset=utf-8'};
let server;
let base=process.env.DCU_BASE_URL;
if(!base){
  server=createServer(async(req,res)=>{
    try{
      let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(path.endsWith('/')) path+='index.html';
      const full=resolve(root,'.'+path);
      if(!full.startsWith(root)) throw new Error('Ruta no autorizada');
      res.setHeader('Content-Type',mime[extname(full)]||'application/octet-stream');
      res.end(await readFile(full));
    }catch{res.statusCode=404;res.end('No encontrado');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${server.address().port}/`;
}
base=base.replace(/\/?$/,'/');
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const tools=['plan-investigacion-y-consentimiento','guion-de-investigacion','registro-de-evidencias','analisis-de-tareas-y-contexto'];
const sample='Prueba ficticia | ruta\\registro\nOtra línea <img src=x onerror="window.injected=true">';
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
try{
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const name of tools){
    await page.goto(`${base}${name}/app/`);
    await expect(page.locator('#download')).toBeEnabled();
    await expect(page.locator('.report-section')).toHaveCount(5);
    await page.locator('textarea').first().fill(`${name}: ${sample}`);
    await page.locator('.report-section').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
    await page.locator('[data-field="field-0"]').fill(sample);
    await page.locator('[data-check="check-0"]').check();
    const add=page.locator('[data-add]').first();
    const table=await add.getAttribute('data-add');
    await add.click();
    const row=page.locator(`[data-editor="${table}"] .card`).last();
    await row.locator('textarea').first().fill('Entrada añadida');
    await row.getByRole('button',{name:/Eliminar/}).click();
    await expect(page.locator('#confirmation')).toBeVisible();
    await page.locator('#confirmation button[value="cancel"]').click();
    const pending=page.waitForEvent('download');
    await page.locator('#download').click();
    const downloaded=await pending;
    expect(downloaded.suggestedFilename()).toBe(`ciclo-01-${name}.md`);
    const file=await downloaded.path();
    await page.reload();
    await expect(page.locator('textarea').first()).toHaveValue(`${name}: ${sample}`);
    expect(await page.evaluate(()=>window.injected)).toBeUndefined();
    await page.locator('#import').setInputFiles(file);
    await expect(page.locator('#confirmation')).toBeVisible();
    await page.locator('#confirmation button[value="cancel"]').click();
    await page.locator('#reset').click();
    await page.locator('#confirmation button[value="confirm"]').click();
    await page.locator('#import').setInputFiles(file);
    await expect(page.locator('textarea').first()).toHaveValue(`${name}: ${sample}`);
    await expect(page.locator('[data-field="field-0"]')).toHaveValue(sample);
    await expect(page.locator('[data-check="check-0"]')).toBeChecked();
    await expect(page.locator(`[data-editor="${table}"] .card`).last().locator('textarea').first()).toHaveValue('Entrada añadida');
    await page.locator('#import').setInputFiles({name:'ajeno.md',mimeType:'text/markdown',buffer:Buffer.from('# Documento ajeno')});
    await expect(page.locator('#status')).toContainText('No se ha importado');
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:844});
      await page.locator('.report-section').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
    await expect(page.locator('#back-to-sections')).toBeInViewport();
    await page.locator('#back-to-sections').click();
    await expect(page.locator('#navigation a').first()).toBeFocused();
    console.log(`OK ${name}: guardado, importación/exportación, confirmaciones, filas, móvil y navegación.`);
  }
  for(const name of tools){
    await page.goto(`${base}${name}/app/`);
    await expect(page.locator('textarea').first()).toHaveValue(`${name}: ${sample}`);
  }
  await page.goto(`${base}app/`);
  await expect(page.locator('#download')).toBeEnabled();
  await page.locator('textarea').first().fill('Brief independiente');
  await page.reload();
  await expect(page.locator('textarea').first()).toHaveValue('Brief independiente');
  console.log('OK borradores independientes y brief existente.');
  await page.goto(`${base}${tools[0]}/app/`);
  await expect(page.locator('#download')).toBeEnabled();
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('Fallo simulado');};});
  await page.locator('textarea').first().fill('Cambio descargable sin almacenamiento');
  await expect(page.locator('#status')).toContainText('No se ha podido guardar');
  await expect(page.locator('#download')).toBeEnabled();
  expect(errors).toEqual([]);
  console.log('OK aviso de fallo de almacenamiento y ausencia de errores JavaScript.');
}finally{
  await context.close();await browser.close();
  if(server) await new Promise(resolve=>server.close(resolve));
}
