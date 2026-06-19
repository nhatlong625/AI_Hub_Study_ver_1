package com.aistudyhub.practice.repository;

import com.aistudyhub.practice.entity.PracticeTestEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PracticeTestRepository extends JpaRepository<PracticeTestEntity, Long> {
    @Query("""
            select p from PracticeTestEntity p
            join fetch p.document d
            join fetch d.owner o
            where p.id = :practiceTestId
              and lower(coalesce(d.status, '')) not in ('deleted', 'archived', 'inactive')
              and (
                    o.id = :userId
                 or lower(coalesce(d.visibilityStatus, '')) in ('public', 'published', 'shared')
                 or exists (
                    select s.id from DocumentShareEntity s
                    where s.documentId = d.id
                      and s.userId = :userId
                      and lower(coalesce(s.status, '')) in ('active', 'accepted', 'shared')
                 )
              )
            """)
    Optional<PracticeTestEntity> findAccessibleById(@Param("practiceTestId") Long practiceTestId, @Param("userId") Long userId);

    @Query("""
            select p from PracticeTestEntity p
            join fetch p.document d
            join fetch d.owner o
            where lower(coalesce(d.status, '')) not in ('deleted', 'archived', 'inactive')
              and (
                    o.id = :userId
                 or lower(coalesce(d.visibilityStatus, '')) in ('public', 'published', 'shared')
                 or exists (
                    select s.id from DocumentShareEntity s
                    where s.documentId = d.id
                      and s.userId = :userId
                      and lower(coalesce(s.status, '')) in ('active', 'accepted', 'shared')
                 )
              )
            order by p.createdAt desc
            """)
    List<PracticeTestEntity> findAccessibleForUser(@Param("userId") Long userId);
}
