# Sistema de Benefícios

Sistema fullstack para gerenciamento de benefícios financeiros com controle de concorrência.

## Funcionalidades

- CRUD completo de benefícios
- Transferência entre benefícios com validações
- Controle de concorrência (Optimistic/Pessimistic Locking)
- Documentação automática (Swagger)
- Testes automatizados

## Tecnologias

**Backend:** Java 17, Spring Boot 3.2.5, Jakarta EE 10, H2 Database  
**Frontend:** Angular 17, TypeScript  
**Testes:** JUnit 5, Mockito

## Correção do Bug EJB

### Problema Original
O código EJB original não tinha validações adequadas e permitia problemas de concorrência.

### Solução
Implementamos:
- ✅ Validação de parâmetros e saldo suficiente
- ✅ **Pessimistic Locking** - Previne race conditions em transferências
- ✅ **Optimistic Locking** - Controle de versão com `@Version`
- ✅ Exceções customizadas com rollback automático
- ✅ Validação de benefícios ativos

```java
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // Validações
    validateTransferParams(fromId, toId, amount);
    
    // Pessimistic Locking
    Beneficio from = em.find(Beneficio.class, fromId, LockModeType.PESSIMISTIC_WRITE);
    Beneficio to = em.find(Beneficio.class, toId, LockModeType.PESSIMISTIC_WRITE);
    
    // Validações de existência, status e saldo
    validateBenefits(from, to, amount);
    
    // Transferência
    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    
    em.merge(from);
    em.merge(to);
}
```

## Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.8+
- Node.js 18+ e npm

### Backend
```bash
cd backend-module
mvn spring-boot:run
```
**URL:** http://localhost:8080  
**Swagger:** http://localhost:8080/swagger-ui.html  
**H2 Console:** http://localhost:8080/h2-console (URL: `jdbc:h2:mem:beneficiodb`, user: `sa`)

### Frontend
```bash
cd frontend
npm install
npm start
```
**URL:** http://localhost:4200

### Testes
```bash
# Backend
cd backend-module
mvn test

# Frontend
cd frontend
npm test
```

## API Endpoints

**Base URL:** `http://localhost:8080/api/v1/beneficios`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Lista todos os benefícios |
| `GET` | `/ativos` | Lista benefícios ativos |
| `GET` | `/{id}` | Busca benefício por ID |
| `POST` | `/` | Cria benefício |
| `PUT` | `/{id}` | Atualiza benefício |
| `DELETE` | `/{id}` | Deleta benefício (soft delete) |
| `POST` | `/transferir` | Realiza transferência |

**Documentação completa:** http://localhost:8080/swagger-ui.html

