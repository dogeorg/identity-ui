const { exec } = require('child_process');

setTimeout(function () {
    console.log('(i) Starting identity-ui server...');
    exec('web-dev-server --config ./configs/identity-ui.config.mjs', (error, stdout, stderr) => {
        if (error) {
            console.error(`(✖) Error running dPanel server: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`(✖) Standard Error Output: ${stderr}`);
        }
        console.log(`(i) Output: ${stdout}`);
    });
    console.log('(✔) App running [identity-ui]', 'http://localhost:6060');
}, 1500);
