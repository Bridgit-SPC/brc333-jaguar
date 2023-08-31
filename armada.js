const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runScript(scriptName, startAmount, batch_size) {
    const endAmount = -80000;
    for (let currentAmount = startAmount; currentAmount >= endAmount; currentAmount -= 
batch_size) {
        const command = `node ${scriptName} ${currentAmount} ${batch_size}`;
        console.log(`Running: ${command}`);
        try {
            const { stdout, stderr } = await exec(command);
            console.log(`Script output:\n${stdout}`);
            if (stderr) {
                console.error(`Script error:\n${stderr}`);
            }
        } catch (error) {
            console.error(`Error executing script: ${error}`);
        }
    }
}

async function main() {
    const scriptName = 'ord-novus-brute.js';
    const startAmount = 21000000;
    const batch_size = -500000;

    await runScript(scriptName, startAmount, batch_size);
}

main().catch(err => console.error(err));

