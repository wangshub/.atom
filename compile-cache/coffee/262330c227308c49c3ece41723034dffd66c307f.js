(function() {
  module.exports = {
    personalAccessToken: {
      description: 'Your personal GitHub access token',
      type: 'string',
      "default": '',
      order: 1
    },
    gistId: {
      description: 'ID of gist to use for configuration storage',
      type: 'string',
      "default": '',
      order: 2
    },
    gistDescription: {
      description: 'The description of the gist',
      type: 'string',
      "default": 'automatic update by http://atom.io/packages/sync-settings',
      order: 3
    },
    syncSettings: {
      type: 'boolean',
      "default": true,
      order: 4
    },
    blacklistedKeys: {
      description: "Comma-seperated list of blacklisted keys (e.g. 'package-name,other-package-name.config-name')",
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      order: 5
    },
    syncPackages: {
      type: 'boolean',
      "default": true,
      order: 6
    },
    syncKeymap: {
      type: 'boolean',
      "default": true,
      order: 7
    },
    syncStyles: {
      type: 'boolean',
      "default": true,
      order: 8
    },
    syncInit: {
      type: 'boolean',
      "default": true,
      order: 9
    },
    syncSnippets: {
      type: 'boolean',
      "default": true,
      order: 10
    },
    extraFiles: {
      description: 'Comma-seperated list of files other than Atom\'s default config files in ~/.atom',
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      order: 11
    },
    checkForUpdatedBackup: {
      description: 'Check for newer backup on Atom start',
      type: 'boolean',
      "default": true,
      order: 12
    },
    _lastBackupHash: {
      type: 'string',
      "default": '',
      description: 'Hash of the last backup restored or created',
      order: 13
    },
    quietUpdateCheck: {
      type: 'boolean',
      "default": false,
      description: "Mute 'Latest backup is already applied' message",
      order: 14
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc3luYy1zZXR0aW5ncy9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsbUJBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSxtQ0FBYjtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO01BR0EsS0FBQSxFQUFPLENBSFA7S0FGYTtJQU1mLE1BQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSw2Q0FBYjtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO01BR0EsS0FBQSxFQUFPLENBSFA7S0FQYTtJQVdmLGVBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSw2QkFBYjtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUywyREFGVDtNQUdBLEtBQUEsRUFBTyxDQUhQO0tBWmE7SUFnQmYsWUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxLQUFBLEVBQU8sQ0FGUDtLQWpCYTtJQW9CZixlQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQWEsK0ZBQWI7TUFDQSxJQUFBLEVBQU0sT0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtNQUdBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSkY7TUFLQSxLQUFBLEVBQU8sQ0FMUDtLQXJCYTtJQTJCZixZQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLEtBQUEsRUFBTyxDQUZQO0tBNUJhO0lBK0JmLFVBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO01BRUEsS0FBQSxFQUFPLENBRlA7S0FoQ2E7SUFtQ2YsVUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxLQUFBLEVBQU8sQ0FGUDtLQXBDYTtJQXVDZixRQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLEtBQUEsRUFBTyxDQUZQO0tBeENhO0lBMkNmLFlBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO01BRUEsS0FBQSxFQUFPLEVBRlA7S0E1Q2E7SUErQ2YsVUFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLGtGQUFiO01BQ0EsSUFBQSxFQUFNLE9BRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7TUFHQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtPQUpGO01BS0EsS0FBQSxFQUFPLEVBTFA7S0FoRGE7SUFzRGYscUJBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSxzQ0FBYjtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO01BR0EsS0FBQSxFQUFPLEVBSFA7S0F2RGE7SUEyRGYsZUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFFBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7TUFFQSxXQUFBLEVBQWEsNkNBRmI7TUFHQSxLQUFBLEVBQU8sRUFIUDtLQTVEYTtJQWdFZixnQkFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7TUFFQSxXQUFBLEVBQWEsaURBRmI7TUFHQSxLQUFBLEVBQU8sRUFIUDtLQWpFYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgcGVyc29uYWxBY2Nlc3NUb2tlbjpcbiAgICBkZXNjcmlwdGlvbjogJ1lvdXIgcGVyc29uYWwgR2l0SHViIGFjY2VzcyB0b2tlbidcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICcnXG4gICAgb3JkZXI6IDFcbiAgZ2lzdElkOlxuICAgIGRlc2NyaXB0aW9uOiAnSUQgb2YgZ2lzdCB0byB1c2UgZm9yIGNvbmZpZ3VyYXRpb24gc3RvcmFnZSdcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICcnXG4gICAgb3JkZXI6IDJcbiAgZ2lzdERlc2NyaXB0aW9uOlxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBnaXN0J1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ2F1dG9tYXRpYyB1cGRhdGUgYnkgaHR0cDovL2F0b20uaW8vcGFja2FnZXMvc3luYy1zZXR0aW5ncydcbiAgICBvcmRlcjogM1xuICBzeW5jU2V0dGluZ3M6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiA0XG4gIGJsYWNrbGlzdGVkS2V5czpcbiAgICBkZXNjcmlwdGlvbjogXCJDb21tYS1zZXBlcmF0ZWQgbGlzdCBvZiBibGFja2xpc3RlZCBrZXlzIChlLmcuICdwYWNrYWdlLW5hbWUsb3RoZXItcGFja2FnZS1uYW1lLmNvbmZpZy1uYW1lJylcIlxuICAgIHR5cGU6ICdhcnJheSdcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICBvcmRlcjogNVxuICBzeW5jUGFja2FnZXM6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiA2XG4gIHN5bmNLZXltYXA6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiA3XG4gIHN5bmNTdHlsZXM6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiA4XG4gIHN5bmNJbml0OlxuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcmRlcjogOVxuICBzeW5jU25pcHBldHM6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiAxMFxuICBleHRyYUZpbGVzOlxuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEtc2VwZXJhdGVkIGxpc3Qgb2YgZmlsZXMgb3RoZXIgdGhhbiBBdG9tXFwncyBkZWZhdWx0IGNvbmZpZyBmaWxlcyBpbiB+Ly5hdG9tJ1xuICAgIHR5cGU6ICdhcnJheSdcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICBvcmRlcjogMTFcbiAgY2hlY2tGb3JVcGRhdGVkQmFja3VwOlxuICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2sgZm9yIG5ld2VyIGJhY2t1cCBvbiBBdG9tIHN0YXJ0J1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcmRlcjogMTJcbiAgX2xhc3RCYWNrdXBIYXNoOlxuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJydcbiAgICBkZXNjcmlwdGlvbjogJ0hhc2ggb2YgdGhlIGxhc3QgYmFja3VwIHJlc3RvcmVkIG9yIGNyZWF0ZWQnXG4gICAgb3JkZXI6IDEzXG4gIHF1aWV0VXBkYXRlQ2hlY2s6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJNdXRlICdMYXRlc3QgYmFja3VwIGlzIGFscmVhZHkgYXBwbGllZCcgbWVzc2FnZVwiXG4gICAgb3JkZXI6IDE0XG59XG4iXX0=
