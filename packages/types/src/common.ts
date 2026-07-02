/**
 * Common shared types used across the platform.
 */

/** ISO 8601 date string */
export type ISODateString = string;

/** MongoDB ObjectId string */
export type ObjectIdString = string;

/** Nullable wrapper */
export type Nullable<T> = T | null;

/** Optional wrapper */
export type Optional<T> = T | undefined;

/** Make specific keys required */
export type RequireFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Make all fields optional except specified keys */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/** Deep partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Environment types */
export type Environment = 'development' | 'test' | 'staging' | 'production';

/** Standard entity base fields */
export interface BaseEntity {
  id: ObjectIdString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Status types */
export type ActiveStatus = 'active' | 'inactive' | 'pending' | 'archived';
