import { describe, expect, it } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

import { App } from "../src/App.jsx";

function createDataTransfer() {
  const data = {};

  return {
    effectAllowed: "all",
    dropEffect: "none",

    setData(type, value) {
      data[type] = value;
    },

    getData(type) {
      return data[type] || "";
    },
  };
}

function getTaskTitles() {
  return within(screen.getByTestId("task-list"))
    .getAllByTestId("draggable-item")
    .map((item) => item.textContent);
}

function dragItem(source, target) {
  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
}

describe("drag-drop-list", () => {
  it("renders all initial tasks", () => {
    render(<App />);

    expect(screen.getByTestId("task-list")).toBeInTheDocument();

    expect(screen.getAllByTestId("draggable-item")).toHaveLength(5);

    expect(getTaskTitles()[0]).toContain("Design homepage");
  });

  it("makes every task draggable", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    items.forEach((item) => {
      expect(item).toHaveAttribute("draggable", "true");
    });
  });

  it("reorders an item when dropped on another item", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    dragItem(items[0], items[2]);

    const updatedTitles = getTaskTitles();

    expect(updatedTitles[0]).toContain("Implement authentication");

    expect(updatedTitles[1]).toContain("Design homepage");

    expect(updatedTitles[2]).toContain("Create dashboard");
  });

  it("supports moving an item to the beginning", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    dragItem(items[4], items[0]);

    expect(getTaskTitles()[0]).toContain("Deploy application");
  });

  it("supports moving an item to the end", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    dragItem(items[0], items[4]);

    expect(getTaskTitles()[4]).toContain("Design homepage");
  });

  it("does not change the order when an item is dropped on itself", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    const originalTitles = getTaskTitles();

    dragItem(items[0], items[0]);

    expect(getTaskTitles()).toEqual(originalTitles);
  });

  it("does not create or remove items during reordering", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    dragItem(items[0], items[3]);

    expect(screen.getAllByTestId("draggable-item")).toHaveLength(5);

    expect(screen.getByTestId("task-count")).toHaveTextContent(
      "Total tasks: 5",
    );

    const ids = screen
      .getAllByTestId("draggable-item")
      .map((item) => item.getAttribute("data-task-id"));

    expect(new Set(ids).size).toBe(5);
  });

  it("updates displayed positions after reordering", () => {
    render(<App />);

    const items = screen.getAllByTestId("draggable-item");

    dragItem(items[0], items[2]);

    const positions = screen
      .getAllByTestId("task-position")
      .map((item) => item.textContent);

    expect(positions).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("allows multiple consecutive reorder operations", () => {
    render(<App />);

    let items = screen.getAllByTestId("draggable-item");

    dragItem(items[0], items[2]);

    items = screen.getAllByTestId("draggable-item");

    dragItem(items[4], items[0]);

    expect(getTaskTitles()[0]).toContain("Deploy application");
    expect(screen.getAllByTestId("draggable-item")).toHaveLength(5);
  });
});
