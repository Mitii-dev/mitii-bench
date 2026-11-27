import {
  ChakraProvider,
  Box,
  Button,
  Heading,
  Text,
  VStack,
  extendTheme,
  useColorMode,
} from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

function CardContent() {
  const { colorMode, toggleColorMode } = useColorMode();

  const isDark = colorMode === "dark";

  return (
    <VStack minH="100vh" justify="center" p={6} spacing={6}>
      <Button
        data-testid="chakra-theme-btn"
        onClick={toggleColorMode}
        colorScheme="teal"
      >
        Switch to {isDark ? "Light" : "Dark"} Mode
      </Button>

      <Box
        data-testid="chakra-card"
        width={{ base: "100%", md: "50%" }}
        maxW="600px"
        p={6}
        borderRadius="lg"
        shadow="lg"
        bg={isDark ? "gray.700" : "gray.100"}
        color={isDark ? "white" : "gray.800"}
      >
        <Heading size="lg" mb={3}>
          Responsive Chakra Card
        </Heading>

        <Text>
          This card adjusts its width based on the screen size and supports
          light and dark color modes.
        </Text>
      </Box>
    </VStack>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CardContent />
    </ChakraProvider>
  );
}

export { App };
export default App;
