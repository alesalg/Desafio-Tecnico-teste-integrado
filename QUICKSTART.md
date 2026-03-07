# 🚀 Guia Rápido de Execução

## ⚡ Start Rápido (Windows)

### 1. Backend

```powershell
# Navegar para backend
cd backend-module

# Executar (compila automaticamente)
mvn spring-boot:run
```

Aguarde a mensagem: `Started BackendApplication in X seconds`

✅ **Backend pronto em:** http://localhost:8080

### 2. Frontend (Nova janela do terminal)

```powershell
# Navegar para frontend
cd frontend

# Instalar dependências (primeira vez)
npm install

# Executar
npm start
```

Aguarde: `** Angular Live Development Server is listening on localhost:4200`

✅ **Frontend pronto em:** http://localhost:4200

---

## 🧪 Rodar Testes

### Backend
```powershell
cd backend-module
mvn test
```

### Frontend
```powershell
cd frontend
npm test
```

---

## 📚 Acessar Documentação

1. **Swagger UI:** http://localhost:8080/swagger-ui.html
2. **H2 Console:** http://localhost:8080/h2-console
   - URL: `jdbc:h2:mem:beneficiodb`
   - User: `sa`
   - Password: (vazio)

---

## 🔧 Troubleshooting

### Porta 8080 em uso
```powershell
# Encontrar processo
netstat -ano | findstr :8080

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### Porta 4200 em uso
```powershell
# Encontrar processo
netstat -ano | findstr :4200

# Matar processo
taskkill /PID <PID> /F
```

### Limpar cache Maven
```powershell
cd backend-module
mvn clean install -U
```

### Limpar cache npm
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Verificação de Funcionamento

### 1. Verificar Backend
```powershell
curl http://localhost:8080/api/v1/beneficios
```

Deve retornar JSON com lista de benefícios.

### 2. Verificar Frontend
Abra o navegador em http://localhost:4200

Deve exibir a tela de listagem de benefícios.

### 3. Testar Transferência

1. Acesse http://localhost:4200/beneficios/transferir
2. Selecione origem e destino
3. Digite um valor
4. Clique em "Transferir"
5. Verifique os novos saldos na listagem

---

## 📦 Build de Produção

### Backend
```powershell
cd backend-module
mvn clean package
java -jar target/backend-module-0.0.1-SNAPSHOT.jar
```

### Frontend
```powershell
cd frontend
npm run build
# Arquivos em: frontend/dist/
```

---

## 🐛 Logs Úteis

### Backend - Ver logs detalhados
```powershell
mvn spring-boot:run -X
```

### Frontend - Ver erros do build
```powershell
npm start -- --verbose
```

---

## 📊 Dados de Teste

### Benefícios Pré-cadastrados

| ID | Nome | Saldo | Status |
|----|------|-------|--------|
| 1  | Beneficio A | R$ 1.000,00 | Ativo |
| 2  | Beneficio B | R$ 500,00 | Ativo |
| 3  | Beneficio C | R$ 2.500,00 | Ativo |
| 4  | Beneficio D | R$ 100,00 | Inativo |

### Exemplo de Transferência

**De:** Beneficio A (ID: 1)  
**Para:** Beneficio B (ID: 2)  
**Valor:** R$ 300,00

**Resultado esperado:**
- Beneficio A: R$ 700,00
- Beneficio B: R$ 800,00

---

## ⏱️ Tempo Médio de Inicialização

- Backend: ~15-30 segundos
- Frontend: ~5-10 segundos
- Testes Backend: ~10-20 segundos

---

**Qualquer problema, consulte o [README.md](README.md) completo!**
