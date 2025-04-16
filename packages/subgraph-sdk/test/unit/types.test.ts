import { describe, it, expect } from 'vitest';
import type { 
  CollectionQuery, 
  CollectionCallback, 
  CollectionCallbackParams 
} from '../../src';

describe('types', () => {
  describe('CollectionQuery', () => {
    it('should accept number parameters', () => {
      const query: CollectionQuery = (skip: number | string, pageSize: number | string) => 
        `query { items(skip: ${skip}, first: ${pageSize}) { id } }`;
      
      expect(query(0, 10)).toBe('query { items(skip: 0, first: 10) { id } }');
    });

    it('should accept string parameters', () => {
      const query: CollectionQuery = (skip: number | string, pageSize: number | string) => 
        `query { items(skip: ${skip}, first: ${pageSize}) { id } }`;
      
      expect(query('0', '10')).toBe('query { items(skip: 0, first: 10) { id } }');
    });
  });

  describe('CollectionCallback', () => {
    it('should accept result and params', () => {
      const callback: CollectionCallback = (result, params) => {
        expect(result).toBeDefined();
        expect(params).toBeDefined();
        expect(params.pageSize).toBeDefined();
        expect(params.loopFlag).toBeDefined();
      };

      callback({ data: { items: [] } }, { pageSize: 10, loopFlag: true });
    });
  });

  describe('CollectionCallbackParams', () => {
    it('should have required properties', () => {
      const params: CollectionCallbackParams = {
        pageSize: 10,
        loopFlag: true
      };

      expect(params.pageSize).toBe(10);
      expect(params.loopFlag).toBe(true);
    });
  });
}); 