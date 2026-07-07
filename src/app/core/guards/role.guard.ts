import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['roles'] || [];

  return store.select(selectCurrentUser).pipe(
    take(1),
    map(user => {
      const userRole = user?.roles?.name;
      if (userRole && allowedRoles.includes(userRole)) return true;
      router.navigate(['/dashboard']);
      return false;
    }),
  );
};
