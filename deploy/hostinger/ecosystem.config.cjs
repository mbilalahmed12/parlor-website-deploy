module.exports = {
  apps: [
    {
      name: 'parlor-backend',
      cwd: '/var/www/parlor-website/backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'parlor-frontend',
      cwd: '/var/www/parlor-website/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};