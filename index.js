// src/index.js
//TELEGRAM_BOT_TOKEN=7992850388:AAGzWrjjU-Qs9BjthiFxdP2UXn0FDGnazH4
require('dotenv').config();
const { ethers } = require('ethers'); // Import correto para ethers.js v5
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

// Configurações do ambiente
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RPC_URL = process.env.RPC_URL; // WebSocket URL para BSC Mainnet
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Endereço do contrato Crowdsale na BSC Mainnet
const CONTRACT_ADDRESS2 = process.env.CONTRACT_ADDRESS2;
const PORT = process.env.PORT || 3001;

// Inicializar o bot do Telegram
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Carregar o ABI do contrato Crowdsale
const crowdsaleAbiPath = path.join(__dirname, 'abi', 'Crowdsale.json');
const crowdsaleAbi = JSON.parse(fs.readFileSync(crowdsaleAbiPath, 'utf8'));

// Carregar o ABI do token ERC20
const tokenAbiPath = path.join(__dirname, 'abi', 'IERC20Metadata.json');
const tokenAbi = JSON.parse(fs.readFileSync(tokenAbiPath, 'utf8'));

// Inicializar o provider com WebSocket
let provider;
let crowdsaleContract;

// Função para inicializar o provider e contratos
const initializeProvider = () => {
    provider = new ethers.providers.WebSocketProvider(RPC_URL);

    provider._websocket.on('open', () => {
        console.log('Conectado ao WebSocket Provider.');
    });

    provider._websocket.on('close', (code) => {
        console.error(`WebSocket fechado com o código: ${code}. Tentando reconectar...`);
        reconnectProvider();
    });

    provider._websocket.on('error', (err) => {
        console.error('Erro no WebSocket Provider:', err);
        provider.destroy();
    });

    // Inicializar o contrato Crowdsale
    try {
        crowdsaleContract = new ethers.Contract(CONTRACT_ADDRESS, crowdsaleAbi, provider);
        console.log('Contrato Crowdsale inicializado com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar o contrato Crowdsale:', error);
    }
};

// Função para reconectar o provider WebSocket
const reconnectProvider = () => {
    console.log('Tentando reconectar ao WebSocket Provider...');
    setTimeout(() => {
        provider = new ethers.providers.WebSocketProvider(RPC_URL);
        crowdsaleContract = crowdsaleContract.connect(provider);
        monitorSales();
    }, 10000); // Tenta reconectar após 10 segundos
};

// Função para obter a instância do contrato do token
const getTokenContract = async () => {
    try {
        const tokenAddress = await crowdsaleContract.token();
        console.log(`Endereço do Token: ${tokenAddress}`); // Log de depuração

        if (ethers.utils.isAddress(tokenAddress)) { // Usando ethers.js v5
            return new ethers.Contract(tokenAddress, tokenAbi, provider);
        } else {
            throw new Error('Endereço do token inválido.');
        }
    } catch (error) {
        console.error('Erro ao obter o endereço do token:', error);
        throw error;
    }
};

// Função para enviar mensagem ao Telegram
const sendTelegramMessage = (message) => {
    bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' })
        .then(() => console.log('Mensagem enviada ao Telegram'))
        .catch((err) => console.error('Erro ao enviar mensagem ao Telegram:', err));
};

// Função para monitorar vendas
const monitorSales = async () => {
    try {
        const tokenContract = await getTokenContract();
        console.log('Monitorando vendas...');

        crowdsaleContract.on('TokensPurchased', async (purchaser, beneficiary, value, amount, event) => {
            try {
                const formattedValue = ethers.utils.formatEther(value);
                const decimals = await tokenContract.decimals(); // Chamar a função decimais()
                const formattedAmount = ethers.utils.formatUnits(amount, decimals);
                const tokenSymbol = await tokenContract.symbol(); // Garantir que symbol() é chamada corretamente

                console.log(`Venda detectada: ${formattedValue} BNB para ${beneficiary}, quantidade de tokens: ${formattedAmount}`);

                const message = `
🎉 *Nova Venda Detectada!*

👤 *Comprador:* ${purchaser}
🏦 *Beneficiário:* ${beneficiary}
💰 *Valor:* ${formattedValue} BNB
🔢 *Quantidade de Tokens:* ${formattedAmount} ${tokenSymbol}
                `;

                sendTelegramMessage(message);
            } catch (eventError) {
                console.error('Erro ao processar evento TokensPurchased:', eventError);
            }
        });

    } catch (error) {
        console.error('Erro ao monitorar vendas:', error);
    }
};
let provider2;
let crowdsaleContract2;

// Função para inicializar o provider e contratos
const initializeProvider2 = () => {
    provider2 = new ethers.providers.WebSocketProvider(RPC_URL);

    provider2._websocket.on('open', () => {
        console.log('Conectado ao WebSocket Provider.');
    });

    provider2._websocket.on('close', (code) => {
        console.error(`WebSocket fechado com o código: ${code}. Tentando reconectar...`);
        reconnectProvider2();
    });

    provider2._websocket.on('error', (err) => {
        console.error('Erro no WebSocket Provider:', err);
        provider2.destroy();
    });

    // Inicializar o contrato Crowdsale
    try {
        crowdsaleContract2 = new ethers.Contract(CONTRACT_ADDRESS2, crowdsaleAbi, provider);
        console.log('Contrato Crowdsale inicializado com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar o contrato Crowdsale:', error);
    }
};

// Função para reconectar o provider WebSocket
const reconnectProvider2 = () => {
    console.log('Tentando reconectar ao WebSocket Provider...');
    setTimeout(() => {
        provider2 = new ethers.providers.WebSocketProvider(RPC_URL);
        crowdsaleContract2 = crowdsaleContract2.connect(provider);
        monitorSales2();
    }, 10000); // Tenta reconectar após 10 segundos
};

// Função para obter a instância do contrato do token
const getTokenContract2 = async () => {
    try {
        const tokenAddress2 = await crowdsaleContract2.token();
        console.log(`Endereço do Token: ${tokenAddress2}`); // Log de depuração

        if (ethers.utils.isAddress(tokenAddress2)) { // Usando ethers.js v5
            return new ethers.Contract(tokenAddress2, tokenAbi, provider2);
        } else {
            throw new Error('Endereço do token inválido.');
        }
    } catch (error) {
        console.error('Erro ao obter o endereço do token:', error);
        throw error;
    }
};

// Função para enviar mensagem ao Telegram
const sendTelegramMessage2 = (message) => {
    bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' })
        .then(() => console.log('Mensagem enviada ao Telegram'))
        .catch((err) => console.error('Erro ao enviar mensagem ao Telegram:', err));
};

// Função para monitorar vendas
const monitorSales2 = async () => {
    try {
        const tokenContract2 = await getTokenContract2();
        console.log('Monitorando vendas...');

        crowdsaleContract2.on('TokensPurchased', async (purchaser, beneficiary, value, amount, event) => {
            try {
                const formattedValue = ethers.utils.formatEther(value);
                const decimals = await tokenContract2.decimals(); // Chamar a função decimais()
                const formattedAmount = ethers.utils.formatUnits(amount, decimals);
                const tokenSymbol = await tokenContract2.symbol(); // Garantir que symbol() é chamada corretamente

                console.log(`Venda detectada: ${formattedValue} BNB para ${beneficiary}, quantidade de tokens: ${formattedAmount}`);

                const message2 = `
🎉 *Nova Venda Detectada!*

👤 *Comprador:* ${purchaser}
🏦 *Beneficiário:* ${beneficiary}
💰 *Valor:* ${formattedValue} BNB
🔢 *Quantidade de Tokens:* ${formattedAmount} ${tokenSymbol}
                `;

                sendTelegramMessage2(message2);
            } catch (eventError) {
                console.error('Erro ao processar evento TokensPurchased:', eventError);
            }
        });

    } catch (error) {
        console.error('Erro ao monitorar vendas:', error);
    }
};

// Inicializar o provider e contratos
initializeProvider2();

// Iniciar o monitoramento
monitorSales2();

// Inicializar o provider e contratos
initializeProvider();

// Iniciar o monitoramento
monitorSales();
const sendPurchaseGuide2 = () => {
    const guide = `
🔹 *Como Comprar Tokens:*

1. **Enviar BNB para o Contrato:**
   - Envie BNB diretamente para o endereço do contrato: \`${CONTRACT_ADDRESS2}\`
   - Certifique-se de usar a quantidade correta de BNB para obter a quantidade desejada de tokens.

2. **Passos Detalhados:**
   - Abra sua carteira (MetaMask, Trust Wallet, etc.).
   - Selecione a opção para enviar BNB.
   - Cole o endereço do contrato (\`${CONTRACT_ADDRESS2}\`) no campo "Para".
   - Insira a quantidade de BNB que deseja enviar.
   - Confirme a transação.

🔹 *Nota:*
- Verifique sempre o endereço do contrato antes de enviar qualquer BNB.
- As transações na blockchain são irreversíveis.

📢 *Boas Compras!*
    `;
    sendTelegramMessage2(guide);
};

// Função para orientar como comprar
const sendPurchaseGuide = () => {
    const guide = `
🔹 *Como Comprar Tokens:*

1. **Enviar BNB para o Contrato:**
   - Envie BNB diretamente para o endereço do contrato: \`${CONTRACT_ADDRESS}\`
   - Certifique-se de usar a quantidade correta de BNB para obter a quantidade desejada de tokens.

2. **Passos Detalhados:**
   - Abra sua carteira (MetaMask, Trust Wallet, etc.).
   - Selecione a opção para enviar BNB.
   - Cole o endereço do contrato (\`${CONTRACT_ADDRESS}\`) no campo "Para".
   - Insira a quantidade de BNB que deseja enviar.
   - Confirme a transação.

🔹 *Nota:*
- Verifique sempre o endereço do contrato antes de enviar qualquer BNB.
- As transações na blockchain são irreversíveis.

📢 *Boas Compras!*
    `;
    sendTelegramMessage(guide);
};

// Configuração dos comandos do bot
bot.onText(/\/startxnt/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Bem-vindo ao Bot da Crowdsale! Use /help para ver os comandos disponíveis.");
});

bot.onText(/\/helpxnt/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📋 *Comandos Disponíveis:*
/startxnt - Iniciar interação com o bot
/helpxnt - Mostrar esta mensagem de ajuda
/guidexnt - Receber orientações de como comprar tokens
/status - Verificar o status atual da Pre-venda
    `;
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/guidexnt/, (msg) => {
    sendPurchaseGuide();
});

bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const tokenContract = await getTokenContract();
        const weiRaised = await crowdsaleContract.weiRaised();
        const rate = await crowdsaleContract.rate();
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        const remaining = await crowdsaleContract.remainingTokens();
        const formattedRemaining = ethers.utils.formatUnits(remaining, decimals);

        const formattedWeiRaised = ethers.utils.formatEther(weiRaised);
        const formattedRate = ethers.utils.formatEther(rate);
        const message = `
📊 *Status da Pre-Venda xnt:*

🏦 *Tokens restantes* ${formattedRemaining} ${symbol}
💰 *BNB Arrecadados:* ${formattedWeiRaised} BNB
🔢 *Taxa de Conversão:* ${formattedRate} tokens por BNB
🔄 *Símbolo do Token:* ${symbol}
        `;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao buscar status:', error);
        bot.sendMessage(chatId, 'Erro ao buscar o status da crowdsale.');
    }
});
//Hnt
bot.onText(/\/startHxnt/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Bem-vindo ao Bot da Crowdsale! Use /help para ver os comandos disponíveis.");
});

bot.onText(/\/helpHxnt/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📋 *Comandos Disponíveis:*
/startHxnt - Iniciar interação com o bot
/helpHxnt - Mostrar esta mensagem de ajuda
/guideHxnt - Receber orientações de como comprar tokens
/statusHxnt - Verificar o status atual da crowdsale
    `;
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/guideHxnt/, (msg) => {
    sendPurchaseGuide2();
});

bot.onText(/\/statusHxnt/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const tokenContract2 = await getTokenContract();
        const weiRaised = await crowdsaleContract2.weiRaised();
        const rate = await crowdsaleContract2.rate();
        const symbol = await tokenContract2.symbol();
        const decimals = await tokenContract2.decimals();
        const remaining = await crowdsaleContract2.remainingTokens();
        const formattedRemaining = ethers.utils.formatUnits(remaining, decimals);

        const formattedWeiRaised = ethers.utils.formatEther(weiRaised);
        const formattedRate = ethers.utils.formatEther(rate);
        const message = `
📊 *Status da Pre-Venda Hxnt:*

🏦 *Nfts restantes* ${formattedRemaining} ${symbol}
💰 *BNB Arrecadados:* ${formattedWeiRaised} BNB
🔢 *Taxa de Conversão:* ${formattedRate} Nfts por BNB
🔄 *Símbolo do Token:* ${symbol}
        `;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao buscar status:', error);
        bot.sendMessage(chatId, 'Erro ao buscar o status da crowdsale.');
    }
});

// Endpoint para enviar guia de compra (Opcional)
app.get('/send-purchase-guide', (req, res) => {
    sendPurchaseGuide();
    res.send('Guia de compra enviado ao Telegram.');
});

// Endpoint para obter tokens restantes
app.get('/remaining-tokens', async (req, res) => {
    try {
        const tokenContract = await getTokenContract();
        const remaining = await crowdsaleContract.remainingTokens();
        const decimals = await tokenContract.decimals();
        const formattedRemaining = ethers.utils.formatUnits(remaining, decimals);
        res.json({ remainingTokens: formattedRemaining });
    } catch (error) {
        console.error('Erro ao obter tokens restantes:', error);
        res.status(500).json({ error: 'Erro ao obter tokens restantes.' });
    }
});

// Endpoint para obter a taxa de conversão
app.get('/rate', async (req, res) => {
    try {
        const rate = await crowdsaleContract.rate();
        res.json({ rate: rate.toString() });
    } catch (error) {
        console.error('Erro ao obter a taxa:', error);
        res.status(500).json({ error: 'Erro ao obter a taxa.' });
    }
});

// Endpoint para obter o endereço da carteira
app.get('/wallet', async (req, res) => {
    try {
        const walletAddress = await crowdsaleContract.wallet();
        res.json({ wallet: walletAddress });
    } catch (error) {
        console.error('Erro ao obter a carteira:', error);
        res.status(500).json({ error: 'Erro ao obter a carteira.' });
    }
});

// Iniciar o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});