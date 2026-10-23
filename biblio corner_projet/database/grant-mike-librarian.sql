-- Accorde à Mike Oliver Candio les droits bibliothécaire.
-- Il pourra ajouter et modifier les livres, sans les supprimer.
UPDATE users
SET role = 'librarian'
WHERE LOWER(email) = 'mikeolivercandio@gmail.com';
