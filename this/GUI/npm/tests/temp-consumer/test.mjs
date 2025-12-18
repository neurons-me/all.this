
    import GUI from "this.gui";
    import assert from "assert";

    assert.ok(GUI.version, "Version should be accessible");
    assert.ok(GUI.GuiProvider, "GuiProvider should be accessible");
    assert.ok(!GUI.QRouter, "QRouter should not be accessible in core bundle");
  