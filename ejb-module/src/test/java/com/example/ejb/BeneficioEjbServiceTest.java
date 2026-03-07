package com.example.ejb;

import com.example.ejb.exception.BeneficioNaoEncontradoException;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.ValidacaoException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do EJB Service")
class BeneficioEjbServiceTest {

    @Mock
    private EntityManager em;

    @InjectMocks
    private BeneficioEjbService service;

    private Beneficio from;
    private Beneficio to;

    @BeforeEach
    void setUp() {
        from = new Beneficio();
        from.setId(1L);
        from.setNome("Beneficio From");
        from.setValor(new BigDecimal("1000.00"));
        from.setAtivo(true);

        to = new Beneficio();
        to.setId(2L);
        to.setNome("Beneficio To");
        to.setValor(new BigDecimal("500.00"));
        to.setAtivo(true);
    }

    @Test
    @DisplayName("Deve realizar transferência com sucesso")
    void deveRealizarTransferenciaComSucesso() {
        BigDecimal amount = new BigDecimal("300.00");
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        service.transfer(1L, 2L, amount);

        assertThat(from.getValor()).isEqualByComparingTo("700.00");
        assertThat(to.getValor()).isEqualByComparingTo("800.00");
        verify(em, times(1)).merge(from);
        verify(em, times(1)).merge(to);
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando fromId é nulo")
    void deveLancarExcecaoQuandoFromIdNulo() {
        assertThatThrownBy(() -> service.transfer(null, 2L, new BigDecimal("100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("não podem ser nulos");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando toId é nulo")
    void deveLancarExcecaoQuandoToIdNulo() {
        assertThatThrownBy(() -> service.transfer(1L, null, new BigDecimal("100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("não podem ser nulos");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando amount é nulo")
    void deveLancarExcecaoQuandoAmountNulo() {
        assertThatThrownBy(() -> service.transfer(1L, 2L, null))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("não podem ser nulos");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando IDs são iguais")
    void deveLancarExcecaoQuandoIdsIguais() {
        assertThatThrownBy(() -> service.transfer(1L, 1L, new BigDecimal("100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("mesmo benefício");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando valor é zero")
    void deveLancarExcecaoQuandoValorZero() {
        assertThatThrownBy(() -> service.transfer(1L, 2L, BigDecimal.ZERO))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("maior que zero");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando valor é negativo")
    void deveLancarExcecaoQuandoValorNegativo() {
        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("-100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("maior que zero");
    }

    @Test
    @DisplayName("Deve lançar BeneficioNaoEncontradoException quando from não existe")
    void deveLancarExcecaoQuandoFromNaoExiste() {
        when(em.find(Beneficio.class, 999L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);

        assertThatThrownBy(() -> service.transfer(999L, 2L, new BigDecimal("100.00")))
                .isInstanceOf(BeneficioNaoEncontradoException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Deve lançar BeneficioNaoEncontradoException quando to não existe")
    void deveLancarExcecaoQuandoToNaoExiste() {
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 999L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);

        assertThatThrownBy(() -> service.transfer(1L, 999L, new BigDecimal("100.00")))
                .isInstanceOf(BeneficioNaoEncontradoException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando from está inativo")
    void deveLancarExcecaoQuandoFromInativo() {
        from.setAtivo(false);
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("inativo");
    }

    @Test
    @DisplayName("Deve lançar ValidacaoException quando to está inativo")
    void deveLancarExcecaoQuandoToInativo() {
        to.setAtivo(false);
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("100.00")))
                .isInstanceOf(ValidacaoException.class)
                .hasMessageContaining("inativo");
    }

    @Test
    @DisplayName("Deve lançar SaldoInsuficienteException quando saldo é insuficiente")
    void deveLancarExcecaoQuandoSaldoInsuficiente() {
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("2000.00")))
                .isInstanceOf(SaldoInsuficienteException.class)
                .hasMessageContaining("Saldo insuficiente");
    }

    @Test
    @DisplayName("Deve usar PESSIMISTIC_WRITE lock")
    void deveUsarPessimisticLock() {
        
        BigDecimal amount = new BigDecimal("100.00");
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        
        service.transfer(1L, 2L, amount);

        
        verify(em, times(1)).find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE);
        verify(em, times(1)).find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE);
    }

    @Test
    @DisplayName("Deve validar saldo exato na transferência")
    void deveValidarSaldoExatoNaTransferencia() {
        
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        
        service.transfer(1L, 2L, new BigDecimal("1000.00"));

        
        assertThat(from.getValor()).isEqualByComparingTo("0.00");
        assertThat(to.getValor()).isEqualByComparingTo("1500.00");
    }
}
