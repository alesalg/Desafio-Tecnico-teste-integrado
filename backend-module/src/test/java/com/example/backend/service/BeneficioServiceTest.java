package com.example.backend.service;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.dto.TransferenciaRequest;
import com.example.backend.dto.TransferenciaResponse;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.BeneficioMapper;
import com.example.backend.model.Beneficio;
import com.example.backend.repository.BeneficioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do Service de Benefícios")
class BeneficioServiceTest {

    @Mock
    private BeneficioRepository repository;

    @Mock
    private BeneficioMapper mapper;

    @InjectMocks
    private BeneficioService service;

    private Beneficio beneficio;
    private BeneficioRequest request;
    private BeneficioResponse response;

    @BeforeEach
    void setUp() {
        beneficio = Beneficio.builder()
                .id(1L)
                .nome("Teste")
                .descricao("Descrição teste")
                .valor(new BigDecimal("1000.00"))
                .ativo(true)
                .version(0L)
                .build();

        request = BeneficioRequest.builder()
                .nome("Teste")
                .descricao("Descrição teste")
                .valor(new BigDecimal("1000.00"))
                .ativo(true)
                .build();

        response = BeneficioResponse.builder()
                .id(1L)
                .nome("Teste")
                .descricao("Descrição teste")
                .valor(new BigDecimal("1000.00"))
                .ativo(true)
                .version(0L)
                .build();
    }

    @Test
    @DisplayName("Deve listar todos os benefícios")
    void deveLlistarTodosBeneficios() {
        when(repository.findAll()).thenReturn(Arrays.asList(beneficio));
        when(mapper.toResponse(beneficio)).thenReturn(response);

        List<BeneficioResponse> result = service.findAll();

        assertThat(result).isNotEmpty().hasSize(1);
        assertThat(result.get(0).getNome()).isEqualTo("Teste");
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar benefício por ID")
    void deveBuscarBeneficioPorId() {
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));
        when(mapper.toResponse(beneficio)).thenReturn(response);

        BeneficioResponse result = service.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getNome()).isEqualTo("Teste");
        verify(repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando benefício não encontrado")
    void deveLancarExcecaoQuandoBeneficioNaoEncontrado() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Deve criar novo benefício")
    void deveCriarNovoBeneficio() {
        when(mapper.toEntity(request)).thenReturn(beneficio);
        when(repository.save(beneficio)).thenReturn(beneficio);
        when(mapper.toResponse(beneficio)).thenReturn(response);

        BeneficioResponse result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.getNome()).isEqualTo("Teste");
        verify(repository, times(1)).save(any(Beneficio.class));
    }

    @Test
    @DisplayName("Deve atualizar benefício existente")
    void deveAtualizarBeneficio() {
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));
        when(repository.save(beneficio)).thenReturn(beneficio);
        when(mapper.toResponse(beneficio)).thenReturn(response);
        doNothing().when(mapper).updateEntity(request, beneficio);

        BeneficioResponse result = service.update(1L, request);

        assertThat(result).isNotNull();
        verify(repository, times(1)).save(beneficio);
    }

    @Test
    @DisplayName("Deve deletar benefício (soft delete)")
    void deveDeletarBeneficio() {
        when(repository.findById(1L)).thenReturn(Optional.of(beneficio));
        when(repository.save(beneficio)).thenReturn(beneficio);

        service.delete(1L);

        assertThat(beneficio.getAtivo()).isFalse();
        verify(repository, times(1)).save(beneficio);
    }

    @Test
    @DisplayName("Deve realizar transferência com sucesso")
    void deveRealizarTransferenciaComSucesso() {
        Beneficio from = Beneficio.builder()
                .id(1L).nome("From").valor(new BigDecimal("1000.00")).ativo(true).build();
        Beneficio to = Beneficio.builder()
                .id(2L).nome("To").valor(new BigDecimal("500.00")).ativo(true).build();

        TransferenciaRequest transRequest = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(2L)
                .valor(new BigDecimal("300.00"))
                .build();

        when(repository.findByIdWithLock(1L)).thenReturn(Optional.of(from));
        when(repository.findByIdWithLock(2L)).thenReturn(Optional.of(to));
        when(repository.save(from)).thenReturn(from);
        when(repository.save(to)).thenReturn(to);

        TransferenciaResponse result = service.transferir(transRequest);

        assertThat(result).isNotNull();
        assertThat(result.getFromNovoSaldo()).isEqualByComparingTo("700.00");
        assertThat(result.getToNovoSaldo()).isEqualByComparingTo("800.00");
        assertThat(result.getValorTransferido()).isEqualByComparingTo("300.00");
        verify(repository, times(1)).save(from);
        verify(repository, times(1)).save(to);
    }

    @Test
    @DisplayName("Deve lançar exceção ao transferir para mesmo benefício")
    void deveLancarExcecaoAoTransferirParaMesmoBeneficio() {
        TransferenciaRequest transRequest = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(1L)
                .valor(new BigDecimal("100.00"))
                .build();

        assertThatThrownBy(() -> service.transferir(transRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("mesmo benefício");
    }

    @Test
    @DisplayName("Deve lançar exceção ao transferir com saldo insuficiente")
    void deveLancarExcecaoComSaldoInsuficiente() {
        Beneficio from = Beneficio.builder()
                .id(1L).nome("From").valor(new BigDecimal("100.00")).ativo(true).build();
        Beneficio to = Beneficio.builder()
                .id(2L).nome("To").valor(new BigDecimal("500.00")).ativo(true).build();

        TransferenciaRequest transRequest = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(2L)
                .valor(new BigDecimal("500.00"))
                .build();

        when(repository.findByIdWithLock(1L)).thenReturn(Optional.of(from));
        when(repository.findByIdWithLock(2L)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.transferir(transRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Saldo insuficiente");
    }

    @Test
    @DisplayName("Deve lançar exceção ao transferir de benefício inativo")
    void deveLancarExcecaoAoTransferirDeBeneficioInativo() {
        Beneficio from = Beneficio.builder()
                .id(1L).nome("From").valor(new BigDecimal("1000.00")).ativo(false).build();
        Beneficio to = Beneficio.builder()
                .id(2L).nome("To").valor(new BigDecimal("500.00")).ativo(true).build();

        TransferenciaRequest transRequest = TransferenciaRequest.builder()
                .fromId(1L)
                .toId(2L)
                .valor(new BigDecimal("100.00"))
                .build();

        when(repository.findByIdWithLock(1L)).thenReturn(Optional.of(from));
        when(repository.findByIdWithLock(2L)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.transferir(transRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inativo");
    }
}
