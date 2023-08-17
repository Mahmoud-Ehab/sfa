import fs from 'fs';

import { Screen } from 'sfawd';

import { HTMLScreenInfo } from './HTMLScreenInfo';
import { HTMLView } from './HTMLView';

export class HTMLScreen extends Screen<HTMLScreenInfo> {
  private chunks: Array<string>;

  private appRootDir: string;

  setRootDir(path: string) {
    this.appRootDir = path;
  }
  
  protected init(info: HTMLScreenInfo): void {
    this.chunks = [];
    this.chunks.push(
      `
      <head>
        <title>${info.title || 'No Title'}</title>
        <meta charset="${info.charset || ''}">
        <meta name="viewport" content="${info.viewport || ''}">
        <meta name="description" content="${info.description || ''}">
        <meta name="keywords" content="${info.keywords || ''}">
        <meta name="author" content="${info.author || ''}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">

        <style>
          * {
            margin: 0;
            padding: 0;
          }
          html {
            font-size: 20px;
          }
          #root {
            display: flex;
            flex-flow: column;
            align-items: center;
            width: 100vw;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="root">
        </div>
      </body>
      <script>exports={}</script>
      `
    );
  }

  addView(view: HTMLView): void {
    this.chunks.push(
      /* 
        Notice that the script block shall pass the language, screen width, 
        and screen height info to the view constructor which is usually a 
        page view.

        - the width and the height are necessary for media query.
      */
      `
      <script type="module">
        import { ${view.getClassName()} } from '${view.getFilePath()}';
        const params = new URL(window.location.href).searchParams;
        const view = new ${view.getClassName()}(
          params.get("lang"),
          document.body.clientWidth,
          document.body.clientHeight
        );
        view.draw();
      </script>
      `
    );
  }

  create(): void {
    if (!this.appRootDir) {
      throw Error(`HTMLScreen: setRootDir should be invoked 
      first before create method.`);
    }

    const page = `
      <!DOCTYPE HTML>
      <html>
        ${this.chunks.join('')}
      </html>
    `;
    fs.writeFileSync(`${this.appRootDir}/${this.name}.html`, page);
  }
}