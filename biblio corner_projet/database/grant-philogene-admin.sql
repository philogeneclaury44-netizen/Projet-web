-- Accorde à Philogene Claury les droits administrateur.
UPDATE users
SET role = 'admin'
WHERE LOWER(email) = 'philogeneclaury44@gmail.com';
