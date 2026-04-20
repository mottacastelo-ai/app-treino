(function () {
  function setText(id, text) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function formatPlanned(exercise) {
    return exercise.sets + "x" + exercise.reps;
  }

  function getHistoryEntries(historyEntry) {
    if (!historyEntry) {
      return [];
    }

    return Array.isArray(historyEntry) ? historyEntry : [historyEntry];
  }

  function getLatestHistoryEntry(historyEntry) {
    var entries = getHistoryEntries(historyEntry);
    return entries.length ? entries[entries.length - 1] : null;
  }

  function getTrendStatus(historyEntry) {
    var entries = getHistoryEntries(historyEntry);

    if (entries.length < 2) {
      return "none";
    }

    var currentEntry = entries[entries.length - 1];
    var previousEntry = entries[entries.length - 2];
    var current = currentEntry.sets && currentEntry.sets.length ? currentEntry.sets[currentEntry.sets.length - 1] : null;
    var previous = previousEntry.sets && previousEntry.sets.length ? previousEntry.sets[previousEntry.sets.length - 1] : null;

    if (!current || !previous) {
      return "none";
    }

    if (current.load > previous.load) {
      return "up";
    }

    if (current.load < previous.load) {
      return "down";
    }

    if (current.reps > previous.reps) {
      return "up";
    }

    if (current.reps < previous.reps) {
      return "down";
    }

    return "stable";
  }

  function getTrendLabel(historyEntry) {
    var status = getTrendStatus(historyEntry);

    if (status === "up") {
      return "Tendencia: 🟢 Subindo";
    }

    if (status === "down") {
      return "Tendencia: 🔴 Caindo";
    }

    if (status === "stable") {
      return "Tendencia: 🟡 Estavel";
    }

    return "Tendencia: Sem dados";
  }

  function formatLastResult(historyEntry) {
    var latestEntry = getLatestHistoryEntry(historyEntry);
    if (!latestEntry || !latestEntry.sets || !latestEntry.sets.length) {
      return "Nenhum registro";
    }

    var lastSet = latestEntry.sets[latestEntry.sets.length - 1];
    return lastSet.load + " kg x " + lastSet.reps;
  }

  function getRepRange(repsText) {
    var numbers = String(repsText || "").match(/\d+/g) || [];
    if (!numbers.length) {
      return null;
    }

    var minimum = Number(numbers[0]);
    var maximum = numbers.length > 1 ? Number(numbers[1]) : minimum;

    if (maximum < minimum) {
      maximum = minimum;
    }

    return {
      minimum: minimum,
      maximum: maximum
    };
  }

  function getLoadSuggestion(exercise, historyEntry) {
    var latestEntry = getLatestHistoryEntry(historyEntry);
    if (!latestEntry || !latestEntry.sets || !latestEntry.sets.length) {
      return "";
    }

    var range = getRepRange(exercise.reps);
    if (!range) {
      return "";
    }

    var lastSet = latestEntry.sets[latestEntry.sets.length - 1];
    var reps = Number(lastSet.reps);

    if (!Number.isFinite(reps)) {
      return "";
    }

    if (reps >= range.maximum + 2) {
      return "Sugestao: subir carga";
    }

    if (reps >= range.minimum && reps <= range.maximum + 1) {
      return "Sugestao: manter carga";
    }

    if (reps < range.minimum) {
      return "Sugestao: avaliar reducao";
    }

    return "";
  }

  function renderLastWorkout(lastWorkout) {
    var container = document.getElementById("last-workout-card");
    if (!container) {
      return;
    }

    if (!lastWorkout) {
      container.innerHTML = '<p class="empty-state">Nenhum treino salvo ainda.</p>';
      return;
    }

    container.innerHTML = [
      '<div class="last-workout-main">' + lastWorkout.key + "</div>",
      '<div class="last-workout-meta">' + lastWorkout.name + " - " + lastWorkout.dateLabel + "</div>"
    ].join("");
  }

  function renderWorkoutList(workouts) {
    var container = document.getElementById("workout-list");
    if (!container) {
      return;
    }

    container.innerHTML = workouts.map(function (workout) {
      return [
        '<button class="workout-card" type="button" data-workout-key="' + workout.key + '">',
        '  <div class="workout-card-title">',
        '    <span class="workout-letter">' + workout.key + "</span>",
        "    <strong>" + workout.name + "</strong>",
        "  </div>",
        '  <small>' + workout.exercises.length + " exercícios</small>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderWorkoutPage(workout, session, history) {
    setText("workout-title", workout.name);
    document.getElementById("workout-summary").textContent =
      session && Object.keys(session).length
        ? Object.keys(session).length + " exercício(s) preenchido(s) neste treino."
        : "Nenhum exercício preenchido neste treino ainda.";

    var container = document.getElementById("exercise-list");
    container.innerHTML = workout.exercises.map(function (exercise) {
      var done = Boolean(session[exercise.id]);
      var trendStatus = getTrendStatus(history[exercise.id]);
      return [
        '<button class="exercise-card" type="button" data-exercise-id="' + exercise.id + '">',
        '  <div class="exercise-row">',
        "    <div>",
        '      <h3 class="exercise-name">' + exercise.name + '<span class="trend-dot ' + trendStatus + '" aria-hidden="true"></span></h3>',
        '      <p class="exercise-subline">' + formatPlanned(exercise) + " - Último: " + formatLastResult(history[exercise.id]) + "</p>",
        "    </div>",
        '    <span class="status-badge ' + (done ? "done" : "") + '">' + (done ? "Feito" : "Não iniciado") + "</span>",
        "  </div>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderExercisePage(exercise, historyEntry, savedEntry) {
    var latestEntry = getLatestHistoryEntry(historyEntry);

    setText("exercise-title", exercise.name);
    setText("exercise-planned", formatPlanned(exercise));
    setText("exercise-last-result", formatLastResult(historyEntry));
    setText("exercise-suggestion", getLoadSuggestion(exercise, historyEntry));
    setText("exercise-trend", getTrendLabel(historyEntry));

    var noteField = document.getElementById("exercise-note");
    noteField.value = savedEntry && savedEntry.note ? savedEntry.note : "";

    var container = document.getElementById("series-inputs");
    var rows = ['<div class="series-head"><span>Série</span><span>Carga (kg)</span><span>Reps</span></div>'];
    var existingSets = [];

    if (savedEntry && savedEntry.sets && savedEntry.sets.length) {
      existingSets = savedEntry.sets;
    } else if (latestEntry && latestEntry.sets && latestEntry.sets.length) {
      existingSets = latestEntry.sets;
    }

    for (var i = 0; i < exercise.sets; i += 1) {
      var existing = existingSets[i] || {};
      rows.push([
        '<div class="series-row">',
        '  <div class="series-index">' + (i + 1) + "ª série</div>",
        '  <label class="field-group">',
        "    <span>Carga</span>",
        '    <input type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" data-role="load" data-index="' + i + '" value="' + (existing.load || "") + '">',
        "  </label>",
        '  <label class="field-group">',
        "    <span>Reps</span>",
        '    <input type="number" inputmode="numeric" step="1" min="0" placeholder="0" data-role="reps" data-index="' + i + '" value="' + (existing.reps || "") + '">',
        "  </label>",
        "</div>"
      ].join(""));
    }

    container.innerHTML = rows.join("");
  }

  function renderExerciseHistoryPage(exercise, historyEntry) {
    var container = document.getElementById("history-list");
    var entries = getHistoryEntries(historyEntry).slice().reverse();
    var bestRecentElement = document.getElementById("history-best-recent");
    var evolutionElement = document.getElementById("history-last-series-evolution");
    var trendElement = document.getElementById("history-trend");

    setText("history-title", exercise.name);

    if (!entries.length) {
      if (bestRecentElement) {
        bestRecentElement.textContent = "Nenhum registro";
      }
      if (evolutionElement) {
        evolutionElement.textContent = "Nenhum registro";
      }
      if (trendElement) {
        trendElement.textContent = "Dados insuficientes";
      }
      container.innerHTML = '<div class="history-card"><p class="empty-state">Nenhum historico salvo para este exercicio.</p></div>';
      return;
    }

    var latestEntry = entries[0];
    var bestSet = latestEntry.sets.reduce(function (best, setItem) {
      if (!best) {
        return setItem;
      }

      if (setItem.load > best.load) {
        return setItem;
      }

      if (setItem.load === best.load && setItem.reps > best.reps) {
        return setItem;
      }

      return best;
    }, null);

    var lastSeries = entries
      .map(function (entry) {
        return entry.sets && entry.sets.length ? entry.sets[entry.sets.length - 1] : null;
      })
      .filter(function (setItem) {
        return Boolean(setItem);
      });

    if (bestRecentElement) {
      bestRecentElement.textContent = bestSet
        ? bestSet.load + " kg x " + bestSet.reps + " reps"
        : "Nenhum registro";
    }

    if (evolutionElement) {
      evolutionElement.textContent = lastSeries.length
        ? lastSeries.map(function (setItem) {
            return setItem.load + "x" + setItem.reps;
          }).join(" -> ")
        : "Nenhum registro";
    }

    if (trendElement) {
      trendElement.textContent = getTrendLabel(entries.slice().reverse()).replace("Tendencia: ", "");
    }

    container.innerHTML = entries.map(function (entry) {
      var dateLabel = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(entry.performedAt));

      return [
        '<div class="history-card">',
        '  <p class="history-date">' + dateLabel + "</p>",
        entry.sets.map(function (setItem, index) {
          return '<p class="history-set">Serie ' + (index + 1) + ': ' + setItem.load + ' kg x ' + setItem.reps + ' reps</p>';
        }).join(""),
        "</div>"
      ].join("");
    }).join("");
  }

  function showPage(pageId) {
    var pages = document.querySelectorAll(".page");
    pages.forEach(function (page) {
      page.classList.toggle("active", page.id === pageId);
    });
  }

  function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) {
      existing.remove();
    }

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 2400);
  }

  window.UI = {
    getLatestHistoryEntry: getLatestHistoryEntry,
    renderLastWorkout: renderLastWorkout,
    renderWorkoutList: renderWorkoutList,
    renderWorkoutPage: renderWorkoutPage,
    renderExercisePage: renderExercisePage,
    renderExerciseHistoryPage: renderExerciseHistoryPage,
    showPage: showPage,
    showToast: showToast
  };
})();
