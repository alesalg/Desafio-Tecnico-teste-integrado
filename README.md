# 🏗️ Desafio Fullstack Integrado - Sistema de Benefícios

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17-red.svg)](https://angular.io/)
[![Jakarta EE](https://img.shields.io/badge/Jakarta%20EE-10-blue.svg)](https://jakarta.ee/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Correção do Bug EJB](#correção-do-bug-ejb)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Frontend](#frontend)
- [Decisões Técnicas](#decisões-técnicas)

---

## 🎯 Sobre o Projeto

Sistema completo para gerenciamento de benefícios financeiros com funcionalidades de:
- ✅ CRUD completo de benefícios
- ✅ Transferência entre benefícios com validações
- ✅ Controle de concorrência com Optimistic/Pessimistic Locking
- ✅ Integração entre Spring Boot e EJB
- ✅ Frontend Angular responsivo
- ✅ Documentação automática com Swagger
- ✅ Testes unitários e de integração

---

## 🏛️ Arquitetura

```
┌─────────────────┐
│   Frontend      │  Angular 17
│   (Port 4200)   │  - Components
└────────┬────────┘  - Services
         │           - Reactive Forms
         │ HTTP
         ▼
┌─────────────────┐
│   Backend       │  Spring Boot 3.2.5
│   (Port 8080)   │  - REST Controllers
├─────────────────┤  - Service Layer
│   Service       │  - Repository (JPA)
├─────────────────┤  - Exception Handling
│   Repository    │  - DTO Mapping
└────────┬────────┘
         │ JPA
         ▼
┌─────────────────┐
│   EJB Module    │  Jakarta EE 10
│                 │  - @Stateless EJB
│  BeneficioEJB   │  - Pessimistic Locking
└────────┬────────┘  - Transaction Management
         │
         ▼
┌─────────────────┐
│   Database      │  H2 (em memória)
│   H2            │  - Schema SQL
└─────────────────┘  - Seed Data
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17** - Linguagem principal
- **Spring Boot 3.2.5** - Framework REST
- **Spring Data JPA** - Persistência de dados
- **Jakarta EE 10** - Especificação EJB
- **H2 Database** - Banco de dados em memória
- **Hibernate** - ORM
- **Lombok** - Redução de boilerplate
- **SpringDoc OpenAPI** - Documentação Swagger
- **JUnit 5 + Mockito** - Testes

### Frontend
- **Angular 17** - Framework SPA
- **TypeScript** - Linguagem tipada
- **Reactive Forms** - Formulários reativos
- **HttpClient** - Comunicação com API
- **RxJS** - Programação reativa

### Ferramentas
- **Maven** - Gerenciamento de dependências
- **Git** - Controle de versão

---

## 🐞 Correção do Bug EJB

### Problema Original

```java
// ❌ CÓDIGO BUGADO
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Beneficio from = em.find(Beneficio.class, fromId);
    Beneficio to = em.find(Beneficio.class, toId);
    
    // BUG: Sem validações, sem locking
    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    
    em.merge(from);
    em.merge(to);
}
```

### Problemas Identificados

1. ❌ **Sem validações de parâmetros nulos**
2. ❌ **Não verifica existência dos benefícios**
3. ❌ **Não valida saldo suficiente** → Permite saldo negativo
4. ❌ **Sem locking** → Lost updates em acessos concorrentes
5. ❌ **Sem validação de benefícios ativos**
6. ❌ **Permite transferência para o mesmo benefício**

### Solução Implementada

```java
// ✅ CÓDIGO CORRIGIDO
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // 1. Validação de parâmetros
    if (fromId == null || toId == null || amount == null) {
        throw new ValidacaoException("Parâmetros não podem ser nulos");
    }
    
    if (fromId.equals(toId)) {
        throw new ValidacaoException("IDs não podem ser iguais");
    }
    
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new ValidacaoException("Valor deve ser positivo");
    }
    
    // 2. PESSIMISTIC LOCKING - Previne lost updates
    Beneficio from = em.find(Beneficio.class, fromId, LockModeType.PESSIMISTIC_WRITE);
    Beneficio to = em.find(Beneficio.class, toId, LockModeType.PESSIMISTIC_WRITE);
    
    // 3. Validação de existência
    if (from == null) throw new BeneficioNaoEncontradoException(fromId);
    if (to == null) throw new BeneficioNaoEncontradoException(toId);
    
    // 4. Validação de status ativo
    if (!from.getAtivo() || !to.getAtivo()) {
        throw new ValidacaoException("Benefícios devem estar ativos");
    }
    
    // 5. Validação de saldo
    if (from.getValor().compareTo(amount) < 0) {
        throw new SaldoInsuficienteException(fromId, from.getValor(), amount);
    }
    
    // 6. Operação
    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    
    em.merge(from);
    em.merge(to);
}
```

### Melhorias Implementadas

✅ **Validações Completas**
- Parâmetros nulos
- IDs iguais
- Valores positivos
- Saldo suficiente
- Benefícios ativos

✅ **Pessimistic Locking**
```java
em.find(Beneficio.class, id, LockModeType.PESSIMISTIC_WRITE)
```
- Bloqueia registros durante transação
- Previne race conditions
- Garante consistência

✅ **Optimistic Locking** (camada JPA)
```java
@Version
private Long version;
```
- Detecta conflitos de concorrência
- Lança `OptimisticLockException` em conflitos

✅ **Exceções Customizadas**
- `@ApplicationException(rollback = true)`
- Rollback automático em erros
- Mensagens descritivas

---

## 📁 Estrutura do Projeto

```
bip-teste-integrado/
├── backend-module/           # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/backend/
│   │   │   │   ├── config/           # Configurações (Swagger)
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── dto/              # Request/Response DTOs
│   │   │   │   ├── exception/        # Exception Handlers
│   │   │   │   ├── mapper/           # Entity ↔ DTO Converters
│   │   │   │   ├── model/            # JPA Entities
│   │   │   │   ├── repository/       # JPA Repositories
│   │   │   │   └── service/          # Business Logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql
│   │   └── test/                     # Testes
│   └── pom.xml
│
├── ejb-module/                # EJB Services
│   ├── src/
│   │   ├── main/
│   │   │   └── java/com/example/ejb/
│   │   │       ├── Beneficio.java
│   │   │       ├── BeneficioEjbService.java
│   │   │       └── exception/
│   │   └── test/
│   └── pom.xml
│
├── frontend/                  # Angular Application
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       │   ├── beneficio-list/
│   │       │   ├── beneficio-form/
│   │       │   └── transferencia/
│   │       ├── models/
│   │       ├── services/
│   │       ├── app.module.ts
│   │       └── app-routing.module.ts
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── db/
│   ├── schema.sql
│   └── seed.sql
│
└── README.md                  # Este arquivo
```

---

## 🚀 Como Executar

### Pré-requisitos

- ☕ **Java 17+**
- 📦 **Maven 3.8+**
- 🅰️ **Node.js 18+ e npm**
- 🌐 **Git**

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/bip-teste-integrado.git
cd bip-teste-integrado
```

### 2. Backend (Spring Boot)

```bash
cd backend-module

# Compilar projeto
mvn clean install

# Executar aplicação
mvn spring-boot:run
```

✅ Backend rodando em: `http://localhost:8080`

**Endpoints importantes:**
- 📚 **Swagger UI**: http://localhost:8080/swagger-ui.html
- 📄 **API Docs**: http://localhost:8080/v3/api-docs
- 🗄️ **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:beneficiodb`
  - Username: `sa`
  - Password: (vazio)

### 3. Frontend (Angular)

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start
```

✅ Frontend rodando em: `http://localhost:4200`

### 4. Rodar Testes

**Backend:**
```bash
cd backend-module
mvn test
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## 🔌 Endpoints da API

### Base URL: `http://localhost:8080/api/v1/beneficios`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Lista todos os benefícios |
| `GET` | `/ativos` | Lista apenas benefícios ativos |
| `GET` | `/{id}` | Busca benefício por ID |
| `POST` | `/` | Cria novo benefício |
| `PUT` | `/{id}` | Atualiza benefício |
| `DELETE` | `/{id}` | Deleta benefício (soft delete) |
| `POST` | `/transferir` | Realiza transferência |

### Exemplos de Requisições

**Criar Benefício:**
```bash
curl -X POST http://localhost:8080/api/v1/beneficios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Benefício Teste",
    "descricao": "Descrição do benefício",
    "valor": 1500.00,
    "ativo": true
  }'
```

**Transferir:**
```bash
curl -X POST http://localhost:8080/api/v1/beneficios/transferir \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": 1,
    "toId": 2,
    "valor": 500.00
  }'
```

---

## 🧪 Testes

### Cobertura de Testes

#### Backend
- ✅ **Testes Unitários** (Service Layer)
  - `BeneficioServiceTest` - 11 casos de teste
  - `BeneficioEjbServiceTest` - 13 casos de teste
  
- ✅ **Testes de Integração** (Controller Layer)
  - `BeneficioControllerIntegrationTest` - 10 casos de teste
  
- ✅ **Testes de Concorrência**
  - `ConcurrencyTest` - Validação de locking e race conditions

### Executar Testes

```bash
# Backend - Todos os testes
cd backend-module
mvn test

# Backend - Apenas testes unitários
mvn test -Dtest=*Test

# Backend - Apenas testes de integração
mvn test -Dtest=*IntegrationTest

# EJB Module
cd ejb-module
mvn test
```

### Resultados Esperados

```
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
```

---

## 🎨 Frontend

### Funcionalidades

1. **Lista de Benefícios**
   - Visualização em tabela
   - Filtro por status (ativos/todos)
   - Ordenação
   - Ações: editar, deletar

2. **Formulário de Benefício**
   - Validações em tempo real
   - Modo criar/editar
   - Feedback de erros

3. **Transferência**
   - Seleção de origem e destino
   - Validação de saldo
   - Resumo da operação
   - Feedback visual

### Screenshots

*(Adicione screenshots da aplicação aqui)*

### Tecnologias Frontend

- **Reactive Forms** - Validações robustas
- **HttpClient** - Comunicação HTTP
- **RxJS** - Programação reativa
- **CSS Modular** - Estilos encapsulados

---

## 💡 Decisões Técnicas

### 1. Optimistic vs Pessimistic Locking

**Escolha:** Implementamos **ambos**

- **Pessimistic Locking** no EJB:
  ```java
  em.find(Beneficio.class, id, LockModeType.PESSIMISTIC_WRITE)
  ```
  - Garante exclusividade durante transferências
  - Ideal para operações críticas de saldo

- **Optimistic Locking** na entidade:
  ```java
  @Version
  private Long version;
  ```
  - Detecta conflitos em outras operações
  - Menor overhead para leituras

### 2. DTOs vs Entidades

Usamos **DTOs separados** para:
- ✅ Desacoplar API da estrutura interna
- ✅ Validações específicas por operação
- ✅ Evitar exposição de dados sensíveis
- ✅ Facilitar evolução da API

### 3. Exception Handling Global

`@RestControllerAdvice` centraliza tratamento:
```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(...)
```
- Respostas padronizadas
- Logs centralizados
- Mensagens amigáveis

### 4. H2 Database

Escolhido por ser **in-memory**:
- ✅ Setup zero
- ✅ Rápido para desenvolvimento/testes
- ✅ Console web integrado
- 🔄 Em produção: PostgreSQL/MySQL

### 5. Soft Delete

Implementamos **soft delete**:
```java
beneficio.setAtivo(false);
```
- Preserva histórico
- Permite auditoria
- Reversível

---

## 📊 Melhorias Futuras

- [ ] Autenticação JWT
- [ ] Paginação nos endpoints
- [ ] Cache com Redis
- [ ] Histórico de transferências
- [ ] Relatórios PDF
- [ ] Deploy em Docker
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Actuator

---

## 📝 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)
- Email: seu-email@example.com

---

## 🙏 Agradecimentos

Desenvolvido com ☕ e 💻 para o desafio Fullstack Integrado.

