export const casbinPolicy = `
p, role:staff, /api/v1/user, read
p, role:staff, /api/v1/user/:id, read
p, role:staff, /api/v1/school, read
p, role:staff, /api/v1/school/:id, read
p, role:staff, /api/v1/course, read
p, role:staff, /api/v1/course/:id, read
p, role:staff, /api/v1/blog, read
p, role:staff, /api/v1/blog/:id, read
p, role:staff, /api/v1/banner, read
p, role:staff, /api/v1/banner/:id, read
p, role:staff, /api/v1/video, read
p, role:staff, /api/v1/video/:id, read

p, role:manager, /api/v1/user, create
p, role:manager, /api/v1/user/:id, update
p, role:manager, /api/v1/school, create
p, role:manager, /api/v1/school/:id, update
p, role:manager, /api/v1/course, create
p, role:manager, /api/v1/course/:id, update
p, role:manager, /api/v1/blog, create
p, role:manager, /api/v1/blog/:id, update
p, role:manager, /api/v1/banner, create
p, role:manager, /api/v1/banner/:id, update
p, role:manager, /api/v1/video, create
p, role:manager, /api/v1/video/:id, update

p, role:admin, /api/v1/user, *
p, role:admin, /api/v1/user/:id, *
p, role:admin, /api/v1/school, *
p, role:admin, /api/v1/school/:id, *
p, role:admin, /api/v1/course, *
p, role:admin, /api/v1/course/:id, *
p, role:admin, /api/v1/blog, *
p, role:admin, /api/v1/blog/:id, *
p, role:admin, /api/v1/banner, *
p, role:admin, /api/v1/banner/:id, *
p, role:admin, /api/v1/video, *
p, role:admin, /api/v1/video/:id, *

g, role:admin, role:manager
g, role:manager, role:staff`;
