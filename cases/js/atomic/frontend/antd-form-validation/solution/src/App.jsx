import { useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import "antd/dist/reset.css";

function App() {
  const [success, setSuccess] = useState(false);

  const onFinish = () => {
    setSuccess(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Registration</h2>

      <Form
        data-testid="antd-form"
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={() => setSuccess(false)}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must contain at least 8 characters" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Button
          data-testid="antd-submit"
          type="primary"
          htmlType="submit"
          block
        >
          Register
        </Button>
      </Form>

      {success && (
        <Alert
          type="success"
          message="Registration successful"
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
}

export { App };
export default App;