import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // nodePolyfills(),
    // NodeModulesPolyfills(),
    // GlobalsPolyfills({
    //   process: true,
    //   buffer: true,
    //   define: { 'process.env.var': '"hello"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    // })
    // NodeGlobalsPolyfillPlugin({
    //   buffer: true
    // })
  ],
  define: { global: 'globalThis' }
  // build: {
  //   rollupOptions: {
  //     plugins: [
  //       // nodePolyfills(),
  //       NodeModulesPolyfills(),
  //       GlobalsPolyfills({
  //         process: true,
  //         buffer: true,
  //         define: { 'process.env.var': '"hello"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
  //       })
  //     ]
  //   }
  // }
})
