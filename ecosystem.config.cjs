/**
 * PM2 ecosystem for the local AI stack.
 *
 *   pm2 start ecosystem.config.cjs      # start the watcher daemon
 *   pm2 status                           # check it's running
 *   pm2 logs local-ai-watcher            # tail logs
 *   pm2 save && pm2 startup              # persist across reboots
 *   pm2 stop local-ai-watcher            # stop
 */

module.exports = {
  apps: [
    {
      // Standalone sovereign server on :4100. Also runs the vault watcher
      // in-process, so this one daemon covers API + live indexing for
      // every app in the fleet (Authentifactor, Bowsea, CitiesTroves, …).
      name: "local-ai-server",
      cwd: __dirname,
      script: "npx",
      args: "tsx server/local-ai-server.ts",
      interpreter: "none",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      env: {
        NODE_ENV: "production",
        LOCAL_AI_PORT: "4100",
        LOCAL_AI_HOST: "127.0.0.1",
        LOCAL_AI_WATCH: "true",
        // Bearer token is read at server boot. We load it from
        // ~/.local-ai/authentifactor/token.txt outside this config so
        // the secret never lives in git-tracked files. pm2 will inherit
        // LOCAL_AI_TOKEN from the shell when you start via
        //   LOCAL_AI_TOKEN=$(cat ~/.local-ai/authentifactor/token.txt) \
        //     pm2 restart local-ai-server --update-env
      },
      out_file: "./.pm2/local-ai-server.out.log",
      error_file: "./.pm2/local-ai-server.err.log",
      merge_logs: true,
      time: true,
    },
    {
      // Cloudflare Quick Tunnel — exposes :4100 to the public internet
      // on a random trycloudflare.com URL. No login, no sudo, no domain
      // required. The URL changes every restart — check it with:
      //   pm2 logs cloudflared | grep trycloudflare.com
      // Graduate to a named tunnel (custom domain + stable URL) when
      // you're ready by running `cloudflared tunnel login`.
      name: "cloudflared",
      cwd: __dirname,
      script: "/opt/homebrew/bin/cloudflared",
      args: "tunnel --url http://localhost:4100 --no-autoupdate",
      interpreter: "none",
      autorestart: true,
      max_restarts: 20,
      restart_delay: 5000,
      out_file: "./.pm2/cloudflared.out.log",
      error_file: "./.pm2/cloudflared.err.log",
      merge_logs: true,
      time: true,
    },
    {
      // Standalone watcher — only use this if you run the server with
      // LOCAL_AI_WATCH=false (e.g. when running multiple server replicas
      // and you want a single source of truth for indexing).
      name: "local-ai-watcher",
      cwd: __dirname,
      script: "npx",
      args: "tsx scripts/watch-vault.ts",
      interpreter: "none",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      env: { NODE_ENV: "production" },
      out_file: "./.pm2/local-ai-watcher.out.log",
      error_file: "./.pm2/local-ai-watcher.err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
