#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
test_dir=$(mktemp -d)
trap 'rm -rf "$test_dir"' EXIT
javac -d "$test_dir" android/app/src/main/java/com/emulatormayo/app/GamepadState.java android/tests/GamepadStateTest.java
java -cp "$test_dir" com.emulatormayo.app.GamepadStateTest
