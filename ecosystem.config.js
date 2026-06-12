{
  "apps": [
    {
      "name": "choir-scheduler",
      "script": "./dist/server.js",
      "instances": 1,
      "exec_mode": "cluster",
      "watch": false,
      "ignore_watch": ["node_modules", "dist"],
      "max_memory_restart": "500M",
      "error_file": "./logs/error.log",
      "out_file": "./logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "restart_delay": 4000,
      "max_restarts": 10,
      "min_uptime": "10s",
      "listen_timeout": 3000,
      "kill_timeout": 5000,
      "wait_ready": false,
      "autorestart": true
    }
  ]
}
