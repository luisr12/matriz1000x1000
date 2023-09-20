const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const path = require('path');
const app = express();
const PORT = 3000;


// Função para criar uma matriz de 1000x1000
function criarMatriz() {
  const matriz = [];
  for (let i = 0; i < 1000; i++) {
    matriz[i] = [];
    for (let j = 0; j < 1000; j++) {
      matriz[i][j] = Math.random(); // Preencha com dados aleatórios, ou a lógica desejada
    }
    
  }
  return matriz;
}

if (cluster.isMaster) {
  // Código para o processo master
  console.log(`Número de CPUs: ${numCPUs}`);

  // Fork do processo para cada CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Gerencie a morte dos processos filhos
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Processo filho morreu. PID: ${worker.process.pid}`);
  });
} else {
  // Este é um processo filho (worker)

  // Configure a aplicação Express aqui
  app.get('/com', (req, res) => {
    const inicio = new Date();  // Registrar o momento de início
    const matrizParte = criarMatriz(); // Crie a matriz
    const fim = new Date(); // Registrar o momento de término
  
    const tempoParte = (fim - inicio) / 1000; // Calcular o tempo decorrido em segundos
    res.send(`Tempo de execução para criar a parte da matriz: ${tempoParte} segundos\nParte da matriz criada pelo worker:\n${JSON.stringify(matrizParte[0])}`);
  });
  

  app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
  });
  

  app.listen(PORT, () => {
    console.log(`Processo filho rodando. PID: ${process.pid}`);
  });
}