import { it, describe, expect, vi } from 'vitest'
import * as DatabaseTasks from '../DatabaseTasks'
import { Database, Config, Table, Enum } from '../Typings'
import * as path from 'path'
import * as TableTasks from '../TableTasks'
import * as EnumTasks from '../EnumTasks'
import { Knex } from 'knex'

vi.mock('../TableTasks')
vi.mock('../EnumTasks')

describe('convertDatabaseToTypescript', () => {
  it('should generate basic TypeScript file', () => {
    const database: Database = {
      schemas: [
        {
          name: 'schema_one',
          namespaceName: 'namespace_name',
          tables: [
            {
              name: 'table_one',
              schema: 'schema_one',
              interfaceName: 'interface_name_one',
              comment: 'table_comment_one',
              columns: [
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: 'column_comment_one',
                  propertyName: 'property_one',
                  propertyType: '\'a\' | \'b\'',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                },
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: '',
                  propertyName: 'property_two',
                  propertyType: 'type_two',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                },
              ]
            },
            {
              name: 'table_two',
              schema: 'schema_one',
              interfaceName: 'interface_name_two',
              comment: '',
              columns: [
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: 'column_comment_one',
                  propertyName: 'property_one',
                  propertyType: '\'a\' | \'b\'',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                }
              ],
            }
          ],
          enums: [{
            name: 'enum_one',
            convertedName: 'converted_enum_one',
            schema: 'schema_one',
            values: [{
              originalKey: 'key_one',
              convertedKey: 'converted_key_one',
              value: 'value_one'
            }]
          }]
        }
      ]
    }
    const config: Config = {
      template: new URL('../template.handlebars', import.meta.url).toString()
    }
    
    const expected = `/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/

/* table_comment_one */
export interface interface_name_one {
  
  /* column_comment_one */
  'property_one': 'a' | 'b';
  'property_two': type_two;
}
export interface interface_name_two {
  
  /* column_comment_one */
  'property_one': 'a' | 'b';
}
export enum converted_enum_one {
  'converted_key_one' = 'value_one',
}
`
    
    const result = DatabaseTasks.convertDatabaseToTypescript(database as any, config as any)
    expect(result.replace(/\r/g, '')).toBe(expected)
  })
  it('should generate basic TypeScript file using schema as namespace', () => {
    const database: Database = {
      schemas: [
        {
          name: 'schema_one',
          namespaceName: 'namespace_name',
          tables: [
            {
              name: 'table_one',
              schema: 'schema_one',
              interfaceName: 'interface_name_one',
              comment: 'table_comment_one',
              columns: [
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: 'column_comment_one',
                  propertyName: 'property_one',
                  propertyType: '\'a\' | \'b\'',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                },
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: '',
                  propertyName: 'property_two',
                  propertyType: 'type_two',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                },
              ]
            },
            {
              name: 'table_two',
              schema: 'schema_one',
              interfaceName: 'interface_name_two',
              comment: '',
              columns: [
                {
                  nullable: false,
                  optional: false,
                  columnType: 'StringEnum',
                  comment: 'column_comment_one',
                  propertyName: 'property_one',
                  propertyType: '\'a\' | \'b\'',
                  // Irrelevant fields
                  type: 'type1',
                  isPrimaryKey: true,
                  defaultValue: 'default1',
                  enumSchema: 'enumSchema1',
                  name: 'col1',
                }
              ],
            }
          ],
          enums: [{
            name: 'enum_one',
            convertedName: 'converted_enum_one',
            schema: 'schema_one',
            values: [{
              originalKey: 'key_one',
              convertedKey: 'converted_key_one',
              value: 'value_one'
            }]
          }]
        }
      ]
    }
    const config: Config = {
      template: new URL('../template.handlebars', import.meta.url).toString(),
      schemaAsNamespace: true
    }
    
    const expected = `/*
* This file was generated by a tool.
* Rerun sql-ts to regenerate this file.
*/
export namespace namespace_name {
  
  /* table_comment_one */
  export interface interface_name_one {
    
    /* column_comment_one */
    'property_one': 'a' | 'b';
    'property_two': type_two;
  }
  export interface interface_name_two {
    
    /* column_comment_one */
    'property_one': 'a' | 'b';
  }
  export enum converted_enum_one {
    'converted_key_one' = 'value_one',
  }
}
`
    
    const result = DatabaseTasks.convertDatabaseToTypescript(database as any, config as any)
    expect(result.replace(/\r/g, '')).toBe(expected)
  })
})

describe('handleNumeric', () => {
  it('should handle string', () => {
    const result = DatabaseTasks.handleNumeric('test')
    expect(result).toBe('\'test\'')
  })
  it('should handle number', () => {
    const result = DatabaseTasks.handleNumeric(1)
    expect(result).toBe('1')
  })
})

describe('generateDatabase', () => {
  it('should split into schemas', async () => {
    const config: Config = {
      template: new URL('../template.handlebars', import.meta.url).pathname,
      custom: {
        test: 'test'
      }
    }
    const tables: Table[] = [
      {
        schema: 'schema_one',
        name: 'table_one',
        columns: [],
        comment: '',
        interfaceName: ''
      },
      {
        schema: 'schema_one',
        name: 'table_two',
        columns: [],
        comment: '',
        interfaceName: ''
      },
      {
        schema: 'schema_two',
        name: 'table_three',
        columns: [],
        comment: '',
        interfaceName: ''
      },
    ]
    const enums: Enum[] = [
      {
        schema: 'schema_one',
        name: 'enum_one',
        values: [],
        convertedName: 'converted_one'
      }
    ]
    const expected: Database = {
      custom: {
        test: 'test'
      },
      schemas: [
        {
          name: 'schema_one',
          namespaceName: 'schema_one',
          tables: [tables[0], tables[1]],
          enums
        },
        {
          name: 'schema_two',
          namespaceName: 'schema_two',
          tables: [tables[2]],
          enums: []
        }
      ]
    }
    const db = {} as Knex
    const mockedGetAllTables = vi.mocked(TableTasks.getAllTables).mockResolvedValue(tables)
    const mockedEnumGetAllEnums = vi.mocked(EnumTasks.getAllEnums).mockResolvedValue(enums)
    const result = await DatabaseTasks.generateDatabase(config, db)
    expect(mockedGetAllTables).toHaveBeenCalledWith(db, config)
    expect(mockedEnumGetAllEnums).toHaveBeenCalledWith(db, config)
    expect(result).toEqual(expected)
  })
})