package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.BeneficioMapper;
import com.example.backend.model.Beneficio;
import com.example.backend.repository.BeneficioRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BeneficioService {

    private final BeneficioRepository repository;
    private final BeneficioMapper mapper;

    @Transactional(readOnly = true)
    public List<BeneficioResponse> findAll() {
        log.info("Buscando todos os benefícios");
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> findAllAtivos() {
        log.info("Buscando benefícios ativos");
        return repository.findByAtivoTrue()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BeneficioResponse findById(Long id) {
        log.info("Buscando benefício com ID: {}", id);
        Beneficio beneficio = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefício", id));
        return mapper.toResponse(beneficio);
    }

    @Transactional
    public BeneficioResponse create(BeneficioRequest request) {
        log.info("Criando novo benefício: {}", request.getNome());
        Beneficio beneficio = mapper.toEntity(request);
        Beneficio saved = repository.save(beneficio);
        log.info("Benefício criado com ID: {}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    public BeneficioResponse update(Long id, BeneficioRequest request) {
        log.info("Atualizando benefício ID: {}", id);
        Beneficio beneficio = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefício", id));
        
        mapper.updateEntity(request, beneficio);
        Beneficio updated = repository.save(beneficio);
        log.info("Benefício {} atualizado com sucesso", id);
        return mapper.toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deletando benefício ID: {}", id);
        Beneficio beneficio = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefício", id));
        
        beneficio.setAtivo(false);
        repository.save(beneficio);
        log.info("Benefício {} marcado como inativo", id);
    }

    @Transactional
    public void deletePermanently(Long id) {
        log.info("Deletando permanentemente benefício ID: {}", id);
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Benefício", id);
        }
        repository.deleteById(id);
        log.info("Benefício {} deletado permanentemente", id);
    }

    @Transactional
    public TransferenciaResponse transferir(TransferenciaRequest request) {
        log.info("Iniciando transferência: {} -> {} | Valor: {}", 
                request.getFromId(), request.getToId(), request.getValor());

        try {
            if (request.getFromId().equals(request.getToId())) {
                throw new BusinessException("Não é possível transferir para o mesmo benefício");
            }

            if (request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Valor deve ser maior que zero");
            }

            Beneficio from = repository.findByIdWithLock(request.getFromId())
                    .orElseThrow(() -> new ResourceNotFoundException("Benefício de origem", request.getFromId()));
            
            Beneficio to = repository.findByIdWithLock(request.getToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Benefício de destino", request.getToId()));

            if (!from.getAtivo()) {
                throw new BusinessException("Benefício de origem está inativo");
            }
            if (!to.getAtivo()) {
                throw new BusinessException("Benefício de destino está inativo");
            }

            if (from.getValor().compareTo(request.getValor()) < 0) {
                throw new BusinessException(
                    String.format("Saldo insuficiente. Saldo atual: %.2f | Valor solicitado: %.2f",
                            from.getValor(), request.getValor()));
            }

            from.setValor(from.getValor().subtract(request.getValor()));
            to.setValor(to.getValor().add(request.getValor()));

            repository.save(from);
            repository.save(to);

            log.info("Transferência realizada com sucesso");

            return TransferenciaResponse.builder()
                    .fromId(from.getId())
                    .fromNome(from.getNome())
                    .fromNovoSaldo(from.getValor())
                    .toId(to.getId())
                    .toNome(to.getNome())
                    .toNovoSaldo(to.getValor())
                    .valorTransferido(request.getValor())
                    .dataHora(LocalDateTime.now())
                    .mensagem("Transferência realizada com sucesso")
                    .build();

        } catch (OptimisticLockException e) {
            log.error("Conflito de concorrência na transferência", e);
            throw new BusinessException("Conflito detectado. Tente novamente.");
        }
    }
}
