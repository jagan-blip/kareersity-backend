module.exports = {
    apps: [{
        name: "backend",
        script: "./server/app.js",
        log: './logs/combined.outerr.log',
        error_file: "./logs/error.log",
        watch: true,
        ignore_watch: ["logs/*"],
        env: {
            "NODE_ENV": "demo"
        },
        env_dev: {
            "NODE_ENV": "demo"
        },
        env_prod: {
            "NODE_ENV": "prod"
        }
    }]
}