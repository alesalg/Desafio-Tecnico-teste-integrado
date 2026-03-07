package com.example.ejb;

import com.example.ejb.exception.BeneficioNaoEncontradoException;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.ValidacaoException;
import jakarta.ejb.Stateless;
import jakarta.ejb.TransactionAttribute;
import jakarta.ejb.TransactionAttributeType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;

@Stateless
public class BeneficioEjbService {

    @PersistenceContext
    private EntityManager em;

    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        if (fromId == null || toId == null || amount == null) {
            throw new ValidacaoException("IDs dos benefícios e valor não podem ser nulos");
        }

        if (fromId.equals(toId)) {
            throw new ValidacaoException("Não é possível transferir para o mesmo benefício");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidacaoException("Valor da transferência deve ser maior que zero");
        }

        Beneficio from = em.find(Beneficio.class, fromId, LockModeType.PESSIMISTIC_WRITE);
        Beneficio to = em.find(Beneficio.class, toId, LockModeType.PESSIMISTIC_WRITE);

       // BUG: sem validações, sem locking, pode gerar saldo negativo e lost update
        if (from == null) {
            throw new BeneficioNaoEncontradoException(fromId);
        }
        if (to == null) {
            throw new BeneficioNaoEncontradoException(toId);
        }

        if (!from.getAtivo()) {
            throw new ValidacaoException("Benefício de origem está inativo");
        }
        if (!to.getAtivo()) {
            throw new ValidacaoException("Benefício de destino está inativo");
        }

        if (from.getValor().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(fromId, from.getValor(), amount);
        }

        from.setValor(from.getValor().subtract(amount));
        to.setValor(to.getValor().add(amount));

        em.merge(from);
        em.merge(to);
    }
}
