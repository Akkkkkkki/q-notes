# Author workspace privacy boundary

Q-notes has two different surfaces: the public publication and the author workspace. The
workspace requires a connection before it can read or change author data through the
Worker API. That authentication boundary does not change the visibility of this GitHub
repository.

## What is public

This repository is public. Treat anything committed here as public, including:

- research files and saved ideas;
- draft branches and their Git history;
- pull-request bodies, review comments, and attachments;
- published content and static assets.

Do not put confidential client material, private correspondence, credentials, or other
sensitive raw notes into the repository. Removing a file later does not erase it from Git
history.

## What the workspace controls

The author routes are `/flow/`, `/capture/`, `/interview/`, and `/desk/`. They share
one layout that emits `noindex`, and the sitemap excludes all four routes. These are
discovery controls only; they are not access control.

Author-data API requests are authenticated by the Worker. The public health endpoint
reports configuration presence only and does not return author content or secret values.
Reader-facing pages, search, and feeds are built from the publication content rather than
the author workspace API.

There is currently no repo-backed location that should be described as genuinely private.
Genuinely private source material should remain outside this repository until a separate
storage boundary is deliberately chosen.

## Migration policy

This change does not move, rewrite, or delete existing ideas or drafts. If a future change
moves author data to another store, document the migration and rollback first and keep the
old data untouched until the new path has been verified.
