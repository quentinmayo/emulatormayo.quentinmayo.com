package com.emulatormayo.app;
public final class GamepadStateTest {
    private static void check(boolean value) { if (!value) throw new AssertionError(); }
    public static void main(String[] args) {
        GamepadState s = new GamepadState();
        s.key(12, true); s.motion(-1,1,.5f,-.5f,0,-1,.4f,.7f);
        check(s.button(12)==1 && s.button(6)==.4f && s.axes[0]==-1);
        s.key(12,false); check(s.button(12)==1); // HAT still held.
        s.motion(0,0,0,0,0,0,0,0); check(s.button(12)==0);
        s.key(6,true); s.motion(0,0,0,0,0,0,.2f,0);check(s.button(6)==1);
        s.clear(); for(int i=0;i<17;i++)check(s.button(i)==0);
        for(float value:s.axes)check(value==0);
        s.motion(Float.NaN,Float.POSITIVE_INFINITY,-2,2,0,0,-1,2);
        check(s.axes[0]==0&&s.axes[1]==0&&s.axes[2]==-1&&s.axes[3]==1&&s.button(6)==0&&s.button(7)==1);
        System.out.println("Gamepad state: alias merging, triggers, axes and release passed.");
    }
}
