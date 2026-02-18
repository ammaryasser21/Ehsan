class CustomDropdown {
  constructor(dropdownElement) {
    this.dropdown = dropdownElement;
    this.trigger = this.dropdown.querySelector(".dropdown-trigger");
    this.options = this.dropdown.querySelector(".dropdown-options");
    this.optionItems = this.dropdown.querySelectorAll(".dropdown-options li");
    this.currentText = this.dropdown.querySelector(
      ".current-sort, .dropdown-current"
    );
    this.arrow = this.dropdown.querySelector(".dropdown-arrow");
    this.isOpen = false;

    this.init();
  }

  init() {
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.optionItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectOption(item);
      });
    });

    document.addEventListener("click", (e) => {
      if (!this.dropdown.contains(e.target) && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    document.querySelectorAll(".custom-dropdown.active").forEach((dropdown) => {
      if (dropdown !== this.dropdown) {
        dropdown.classList.remove("active");
      }
    });

    this.dropdown.classList.add("active");
    this.isOpen = true;

    if (this.arrow) {
      this.arrow.style.transform = "rotate(180deg)";
    }
  }

  close() {
    this.dropdown.classList.remove("active");
    this.isOpen = false;

    if (this.arrow) {
      this.arrow.style.transform = "rotate(0deg)";
    }
  }

  selectOption(optionElement) {
    this.optionItems.forEach((item) => item.classList.remove("selected"));

    optionElement.classList.add("selected");

    if (this.currentText) {
      this.currentText.textContent = optionElement.textContent;
    }

    const data = {};
    Array.from(optionElement.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-")) {
        const key = attr.name.replace("data-", "");
        data[key] = attr.value;
      }
    });

    const event = new CustomEvent("dropdown-select", {
      detail: {
        text: optionElement.textContent,
        element: optionElement,
        data: data,
        dropdown: this.dropdown,
      },
      bubbles: true,
    });
    this.dropdown.dispatchEvent(event);

    this.close();
  }

  getSelection() {
    const selected = this.dropdown.querySelector(
      ".dropdown-options li.selected"
    );
    if (selected) {
      const data = {};
      Array.from(selected.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          const key = attr.name.replace("data-", "");
          data[key] = attr.value;
        }
      });
      return {
        text: selected.textContent,
        element: selected,
        data: data,
      };
    }
    return null;
  }

  setSelection(selector) {
    const option = this.dropdown.querySelector(
      `.dropdown-options li${selector}`
    );
    if (option) {
      this.selectOption(option);
    }
  }
}

function initCustomDropdowns() {
  const dropdowns = document.querySelectorAll(".custom-dropdown");
  const instances = [];

  dropdowns.forEach((dropdown) => {
    const instance = new CustomDropdown(dropdown);
    instances.push(instance);

    dropdown.dropdownInstance = instance;
  });

  return instances;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomDropdowns);
} else {
  initCustomDropdowns();
}

class AccordionDropdown {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.trigger = wrapper.querySelector(".dropdown-trigger");
    this.panel = wrapper.querySelector(".accordion-panel");
    this.closeBtn = this.panel.querySelector(".accordion-panel-close");
    this.arrow = wrapper.querySelector(".dropdown-arrow");
    this.groups = this.panel.querySelectorAll(".accordion-group");
    this.isOpen = false;
    this.init();
  }

  init() {
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });

    this.panel.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
      if (!this.wrapper.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    this.groups.forEach((group) => {
      const btn = group.querySelector(".accordion-trigger");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleGroup(group);
      });

      group.querySelectorAll(".accordion-content li").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this.selectItem(item);
        });
      });
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    document.querySelectorAll(".accordion-dropdown.open").forEach((el) => {
      if (el !== this.wrapper) el.classList.remove("open");
    });
    this.wrapper.classList.add("open");
    this.isOpen = true;
    if (this.arrow) this.arrow.style.transform = "rotate(180deg)";
  }

  close() {
    this.wrapper.classList.remove("open");
    this.isOpen = false;
    if (this.arrow) this.arrow.style.transform = "";
  }

  toggleGroup(group) {
    const wasOpen = group.classList.contains("open");
    this.groups.forEach((g) => g.classList.remove("open"));
    if (!wasOpen) group.classList.add("open");
  }

  selectItem(item) {
    this.panel.querySelectorAll(".accordion-content li").forEach((li) => {
      li.classList.remove("selected");
    });
    item.classList.add("selected");

    const span = this.trigger.querySelector("span");
    if (span) span.textContent = item.textContent;

    const event = new CustomEvent("accordion-select", {
      detail: {
        text: item.textContent.trim(),
        category: item.dataset.category || "",
        element: item,
      },
      bubbles: true,
    });
    this.wrapper.dispatchEvent(event);

    this.close();
  }
}

function initAccordionDropdowns() {
  document.querySelectorAll(".accordion-dropdown").forEach((wrapper) => {
    wrapper._accordionInstance = new AccordionDropdown(wrapper);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAccordionDropdowns);
} else {
  initAccordionDropdowns();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CustomDropdown, initCustomDropdowns, AccordionDropdown, initAccordionDropdowns };
}
