package com.senkosun.pastebin.repository;

import com.senkosun.pastebin.entity.Paste;
import com.senkosun.pastebin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasteRepository extends JpaRepository<Paste, Long>  {
    List<Paste> findByUserOrderByCreatedAtDesc(User user);
    List<Paste> findBySlugOrderByCreatedAtDesc(String slug);
    Optional<Paste> findBySlug(String slug);
    boolean existsBySlug(String slug);
//    void deleteByUserAndExpiredTrue(User user);

}
