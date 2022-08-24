import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Home({}) {

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Social Grazing</h1>

        <hr />

        <div>
          <Link to="/new">Deploy a vault</Link>

        </div>
      </div>
    </div>
  );
}
