module.exports = {
  apps: [
    {
      name: 'sd-cosmetique',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/sd-cosmetique',
      env: {
        NODE_ENV: 'production',
        // Ne PAS surcharger PORT ici — Hostinger assigne son propre port via l'env système.
        // next start lit PORT depuis l'environnement (package.json: "next start -p ${PORT:-3000}")
      },
      instances: 1,
      autorestart: true,
      watch: false,
      // Augmenté de 512M → 1G (Next.js 16 en prod peut dépasser 512 Mo)
      max_memory_restart: '1G',
      // Logs pour faciliter le debug sur Hostinger
      error_file: '/var/www/sd-cosmetique/logs/pm2-error.log',
      out_file: '/var/www/sd-cosmetique/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
