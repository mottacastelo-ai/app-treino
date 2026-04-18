(function () {
  var PREFIX = "app-treino";

  function read(key, fallbackValue) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function write(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeRecord(record) {
    if (!record || !record.sets || !record.sets.length) {
      return null;
    }

    return {
      exerciseId: record.exerciseId || "",
      exerciseName: record.exerciseName || "",
      workoutKey: record.workoutKey || "",
      planned: record.planned || "",
      sets: record.sets.map(function (set) {
        return {
          load: Number(set.load),
          reps: Number(set.reps)
        };
      }),
      notes: record.notes || record.note || "",
      performedAt: record.performedAt || new Date().toISOString()
    };
  }

  function normalizeHistory(history) {
    var normalized = {};
    var source = history || {};

    Object.keys(source).forEach(function (exerciseId) {
      var value = source[exerciseId];
      var records = Array.isArray(value) ? value : [value];
      var normalizedRecords = records
        .map(normalizeRecord)
        .filter(function (record) {
          return Boolean(record);
        })
        .sort(function (left, right) {
          return new Date(left.performedAt).getTime() - new Date(right.performedAt).getTime();
        });

      normalized[exerciseId] = normalizedRecords;
    });

    return normalized;
  }

  window.StorageService = {
    getHistory: function () {
      var history = normalizeHistory(read(PREFIX + ".history", {}));
      write(PREFIX + ".history", history);
      return history;
    },
    saveHistory: function (history) {
      write(PREFIX + ".history", normalizeHistory(history));
    },
    getLastWorkout: function () {
      return read(PREFIX + ".lastWorkout", null);
    },
    saveLastWorkout: function (workout) {
      write(PREFIX + ".lastWorkout", workout);
    },
    getWorkoutSession: function (workoutKey) {
      return read(PREFIX + ".session." + workoutKey, {});
    },
    saveWorkoutSession: function (workoutKey, session) {
      write(PREFIX + ".session." + workoutKey, session);
    },
    clearWorkoutSession: function (workoutKey) {
      window.localStorage.removeItem(PREFIX + ".session." + workoutKey);
    }
  };
})();
