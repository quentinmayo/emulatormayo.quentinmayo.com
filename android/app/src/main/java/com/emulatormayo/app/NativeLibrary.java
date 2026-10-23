package com.emulatormayo.app;

import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.StateListDrawable;
import android.hardware.input.InputManager;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import org.json.JSONObject;
import java.util.*;

/** Native Android library; only gameplay is rendered by WebView. */
final class NativeLibrary implements ControllerNavigation.Target,InputManager.InputDeviceListener {
    private final int BG,PANEL,INK,MUTED,ACCENT,FOCUS;
    private final MainActivity activity;private final LinearLayout root;private final GameStore store;private final SharedPreferences prefs;
    private final ControllerNavigation controls;private final InputManager inputs;private final Handler handler=new Handler(Looper.getMainLooper());
    private LinearLayout body;private TextView status,hint,diagnostic;private EditText search;private GridView grid;
    private final List<JSONObject> games=new ArrayList<>();private String screen="library",section="Library",query="",platform="";private boolean favorites;
    private JSONObject selected;
    private android.graphics.Bitmap backdropArt;private String backdropId="";private int coverEpoch;private boolean closed;
    private final java.util.concurrent.ExecutorService coverWorker=java.util.concurrent.Executors.newSingleThreadExecutor();
    private final android.util.LruCache<String,android.graphics.Bitmap> coverCache=new android.util.LruCache<String,android.graphics.Bitmap>(4*1024*1024){protected int sizeOf(String key,android.graphics.Bitmap value){return value.getByteCount();}};
    private final Map<String,List<java.util.function.Consumer<android.graphics.Bitmap>>> pendingCovers=new HashMap<>();
    private int selection;
    NativeLibrary(MainActivity activity,LinearLayout root,GameStore store,SharedPreferences prefs){this.activity=activity;BG=activity.getColor(R.color.mayo_background);PANEL=activity.getColor(R.color.mayo_panel);INK=activity.getColor(R.color.mayo_text);MUTED=activity.getColor(R.color.mayo_muted);ACCENT=activity.getColor(R.color.mayo_accent);FOCUS=activity.getColor(R.color.mayo_focus);this.root=root;this.store=store;this.prefs=prefs;controls=new ControllerNavigation(this);readControls();inputs=(InputManager)activity.getSystemService(android.content.Context.INPUT_SERVICE);inputs.registerInputDeviceListener(this,handler);orientation();}
    private int dp(int value){return Math.round(value*activity.getResources().getDisplayMetrics().density);}
    private boolean shortScreen(){return activity.getResources().getConfiguration().screenHeightDp<480;}
    private boolean compact(){return shortScreen()||prefs.getBoolean("compact",false);}
    private LinearLayout column(){LinearLayout v=new LinearLayout(activity);v.setOrientation(LinearLayout.VERTICAL);return v;}
    private TextView text(String value,int size,int color){TextView v=new TextView(activity);v.setText(value);v.setTextSize(size);v.setTextColor(color);v.setPadding(dp(4),dp(6),dp(4),dp(6));return v;}
    private GradientDrawable shape(int color,boolean focus){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(6));if(focus)d.setStroke(dp(3),ACCENT);return d;}
    private StateListDrawable background(){StateListDrawable d=new StateListDrawable();d.addState(new int[]{android.R.attr.state_focused},shape(FOCUS,true));d.addState(new int[]{android.R.attr.state_selected},shape(FOCUS,true));d.addState(new int[]{android.R.attr.state_pressed},shape(FOCUS,true));d.addState(new int[]{},shape(PANEL,false));return d;}
    private Button button(String title,Runnable action){Button v=new Button(activity);v.setText(title);v.setTextColor(INK);v.setTextSize(14);v.setAllCaps(false);v.setMinHeight(dp(48));v.setMinimumHeight(dp(48));v.setBackground(background());v.setPadding(dp(12),dp(6),dp(12),dp(6));v.setOnClickListener(view->action.run());return v;}
    private void add(LinearLayout parent,View view){LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.setMargins(0,dp(5),0,dp(5));parent.addView(view,lp);}
    private void rowButton(LinearLayout row,String label,Runnable action){LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0,dp(48),1);lp.setMargins(dp(3),0,dp(3),0);row.addView(button(label,action),lp);}
    private void frame(String title){
        controls.stop();root.removeAllViews();applyAppearance();
        boolean rail=shortScreen()&&activity.getResources().getConfiguration().screenWidthDp>=600;
        LinearLayout stage=new LinearLayout(activity);stage.setOrientation(rail?LinearLayout.HORIZONTAL:LinearLayout.VERTICAL);root.addView(stage,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout main=column(),navigation=rail?column():new LinearLayout(activity);navigation.setPadding(dp(8),dp(8),dp(8),dp(8));navigation.setBackgroundColor(activity.getColor(R.color.mayo_rail));
        if(rail){add(navigation,text("EMULATOR\nMAYO",15,ACCENT));stage.addView(navigation,new LinearLayout.LayoutParams(dp(124),-1));stage.addView(main,new LinearLayout.LayoutParams(0,-1,1));}else stage.addView(main,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout header=new LinearLayout(activity);header.setGravity(Gravity.CENTER_VERTICAL);header.setPadding(dp(16),dp(shortScreen()?4:12),dp(16),dp(8));LinearLayout wordmark=column();TextView name=text(rail?title:"EMULATORMAYO",rail?19:20,INK);name.setTypeface(null,Typeface.BOLD);name.setLetterSpacing(.06f);wordmark.addView(name);if(!rail){TextView caption=text(title+"  /  YOUR NEXT SAVE POINT",10,ACCENT);caption.setLetterSpacing(.08f);wordmark.addView(caption);}header.addView(wordmark,new LinearLayout.LayoutParams(0,-2,1));header.addView(text("● LOCAL",10,ACCENT));main.addView(header);
        body=column();body.setPadding(dp(14),dp(4),dp(14),dp(8));main.addView(body,new LinearLayout.LayoutParams(-1,0,1));
        for(String destination:new String[]{"Library","Recent","Co-op","Settings"}){Button item=button(destination,()->{if(destination.equals("Settings"))settings();else if(destination.equals("Co-op"))coop();else{section=destination;screen="library";show();}});if((screen.equals("settings")||screen.equals("controller"))?destination.equals("Settings"):screen.equals("coop")?destination.equals("Co-op"):destination.equals(section))item.setTextColor(ACCENT);LinearLayout.LayoutParams lp=rail?new LinearLayout.LayoutParams(-1,dp(48)):new LinearLayout.LayoutParams(0,dp(48),1);lp.setMargins(dp(3),dp(3),dp(3),dp(3));navigation.addView(item,lp);}
        if(!rail)root.addView(navigation);hint=text(controllerHint(),11,MUTED);hint.setSingleLine(true);hint.setEllipsize(android.text.TextUtils.TruncateAt.END);root.addView(hint);
        root.post(()->{if(!controllers().isEmpty())ControllerFocus.start(body,screen.equals("library")?grid:null);});
    }
    void show(){
        if(screen.equals("settings")){settings();return;}if(screen.equals("coop")){coop();return;}if(screen.equals("controller")){controllerCheck();return;}screen="library";frame(section.toUpperCase(Locale.ROOT));
        search=new EditText(activity);search.setSingleLine(true);search.setTextColor(INK);search.setHintTextColor(MUTED);search.setHint("Search your games  ·  X");search.setText(query);add(body,search);if(shortScreen()&&query.isEmpty())search.setVisibility(View.GONE);
        LinearLayout tools=new LinearLayout(activity);rowButton(tools,"＋ Import",this::importPicker);rowButton(tools,platform.isEmpty()?"All systems":GameStore.system(platform),this::platformPicker);rowButton(tools,favorites?"★ Favorites":"☆ Favorites",()->{favorites=!favorites;show();});add(body,tools);
        status=text("",12,MUTED);body.addView(status);
        grid=new GridView(activity);grid.setFocusable(true);grid.setFocusableInTouchMode(true);grid.setDescendantFocusability(ViewGroup.FOCUS_BLOCK_DESCENDANTS);grid.setNumColumns(GridView.AUTO_FIT);grid.setColumnWidth(dp(compact()?118:152));grid.setStretchMode(GridView.STRETCH_COLUMN_WIDTH);grid.setHorizontalSpacing(dp(10));grid.setVerticalSpacing(dp(10));grid.setPadding(dp(4),dp(4),dp(4),dp(8));grid.setSelector(ControllerFocus.selector(ACCENT,dp(3),dp(6)));grid.setDrawSelectorOnTop(true);grid.setClipToPadding(false);grid.setAdapter(adapter);body.addView(grid,new LinearLayout.LayoutParams(-1,0,1));
        grid.setOnItemClickListener((parent,view,position,id)->{selection=position;detail(games.get(position));});
        grid.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){public void onNothingSelected(AdapterView<?> parent){}public void onItemSelected(AdapterView<?> parent,View view,int position,long id){if(position>=0&&position<games.size())focusBackdrop(games.get(position));}});
        search.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int start,int count,int after){}public void onTextChanged(CharSequence s,int start,int before,int count){query=s.toString();refresh();}public void afterTextChanged(Editable e){}});
        refresh();
        if(store.all().isEmpty()){
            LinearLayout empty=column();add(empty,text("Your next save point.",28,INK));add(empty,text("Bring your own games. Import a file to start your local library—no account, server or internet connection needed.",16,MUTED));Button importButton=button("Import your first game",this::importPicker);add(empty,importButton);add(empty,text("Original files stay where they are. Imports are private copies on this device. No ROMs or BIOS files are included.",13,MUTED));body.removeView(grid);body.addView(empty,new LinearLayout.LayoutParams(-1,0,1));importButton.requestFocus();
        }else ControllerFocus.select(grid,Math.max(0,Math.min(selection,games.size()-1)),!controllers().isEmpty());
    }
    private void refresh(){
        games.clear();String needle=query.trim().toLowerCase(Locale.ROOT);
        for(JSONObject game:store.all())if((needle.isEmpty()||game.optString("name").toLowerCase(Locale.ROOT).contains(needle))&&(platform.isEmpty()||platform.equals(game.optString("core")))&&(!favorites||game.optBoolean("favorite"))&&(!section.equals("Recent")||game.optLong("played")>0))games.add(game);
        games.sort(section.equals("Recent")?(a,b)->Long.compare(b.optLong("played"),a.optLong("played")):(a,b)->a.optString("name").compareToIgnoreCase(b.optString("name")));
        adapter.notifyDataSetChanged();if(status!=null)status.setText(games.size()+" game(s)  ·  "+(section.equals("Recent")?"RECENTLY PLAYED":"STORED ON THIS DEVICE"));
    }
    private final BaseAdapter adapter=new BaseAdapter(){
        public int getCount(){return games.size();}public Object getItem(int position){return games.get(position);}public long getItemId(int position){return position;}
        public View getView(int position,View recycled,android.view.ViewGroup parent){JSONObject game=games.get(position);LinearLayout card=column();card.setPadding(dp(5),dp(5),dp(5),dp(8));card.setBackground(background());card.setContentDescription(game.optString("name")+" · "+GameStore.system(game.optString("core")));
            View cover=cover(game);card.addView(cover,new LinearLayout.LayoutParams(-1,dp(compact()?112:156)));TextView name=text(game.optString("name"),14,INK);name.setTypeface(null,Typeface.BOLD);name.setMaxLines(2);name.setEllipsize(android.text.TextUtils.TruncateAt.END);card.addView(name);TextView system=text((game.optBoolean("favorite")?"★  ":"")+GameStore.system(game.optString("core")),10,MUTED);system.setSingleLine(true);system.setEllipsize(android.text.TextUtils.TruncateAt.END);card.addView(system);return card;
        }
    };
    private View cover(JSONObject game){TextView tile=text("▶\n"+game.optString("core").toUpperCase(Locale.ROOT),27,INK);tile.setGravity(Gravity.CENTER);tile.setTypeface(null,Typeface.BOLD);tile.setLetterSpacing(.06f);int color=Color.HSVToColor(new float[]{135+Math.floorMod(game.optString("core").hashCode(),40),.60f,.35f});GradientDrawable background=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{color,BG});background.setCornerRadius(dp(5));tile.setBackground(background);tile.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);FrameLayout frame=new FrameLayout(activity);frame.addView(tile,new FrameLayout.LayoutParams(-1,-1));String id=game.optString("id");loadCover(id,bitmap->{if(bitmap==null)return;ImageView image=new ImageView(activity);image.setScaleType(ImageView.ScaleType.CENTER_CROP);image.setImageBitmap(bitmap);image.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);frame.removeAllViews();frame.addView(image,new FrameLayout.LayoutParams(-1,-1));});return frame;}
    private NativeAppearance appearanceBackground(){return new NativeAppearance(NativeAppearance.readMode(prefs),NativeAppearance.readDim(prefs),"emulatormayo",backdropArt);}
    private void applyAppearance(){root.setBackground(appearanceBackground());}
    private void appearance(){AlertDialog dialog=NativeAppearance.settings(activity,prefs,"emulatormayo",()->backdropArt,this::applyAppearance);dialog(dialog);dialog.show();}
    private void loadCover(String id,java.util.function.Consumer<android.graphics.Bitmap> callback){
        if(closed)return;android.graphics.Bitmap cached=coverCache.get(id);if(cached!=null){callback.accept(cached);return;}
        List<java.util.function.Consumer<android.graphics.Bitmap>> waiting=pendingCovers.get(id);if(waiting!=null){if(waiting.size()<8)waiting.add(callback);return;}if(pendingCovers.size()>=64)return;
        waiting=new ArrayList<>();waiting.add(callback);pendingCovers.put(id,waiting);final int epoch=coverEpoch;
        coverWorker.execute(()->{android.graphics.Bitmap found=null;try{found=CoverImages.load(activity,id);}catch(Exception|OutOfMemoryError ignored){}final android.graphics.Bitmap bitmap=found;handler.post(()->{if(closed||epoch!=coverEpoch)return;List<java.util.function.Consumer<android.graphics.Bitmap>> listeners=pendingCovers.remove(id);if(bitmap!=null)coverCache.put(id,bitmap);if(listeners!=null)for(java.util.function.Consumer<android.graphics.Bitmap> listener:listeners)listener.accept(bitmap);});});
    }
    private void focusBackdrop(JSONObject game){String id=game.optString("id");if(id.equals(backdropId))return;backdropId=id;backdropArt=null;applyAppearance();loadCover(id,bitmap->{if(!closed&&id.equals(backdropId)){backdropArt=bitmap;applyAppearance();}});}
    void coverChanged(String id){coverEpoch++;pendingCovers.clear();coverCache.remove(id);backdropId="";backdropArt=null;applyAppearance();JSONObject game=store.find(id);if(game!=null)detail(game);else show();}
    private void importPicker(){AlertDialog picker=new AlertDialog.Builder(activity).setTitle("Import games for…").setItems(GameStore.SYSTEMS,(d,index)->activity.importGames(GameStore.CORES[index])).setNegativeButton("Cancel",null).create();dialog(picker);picker.show();}
    private void platformPicker(){String[] names=new String[GameStore.SYSTEMS.length+1];names[0]="All systems";System.arraycopy(GameStore.SYSTEMS,0,names,1,GameStore.SYSTEMS.length);AlertDialog picker=new AlertDialog.Builder(activity).setTitle("Filter your library").setItems(names,(d,index)->{platform=index==0?"":GameStore.CORES[index-1];show();}).create();dialog(picker);picker.show();}
    private void detail(JSONObject game){
        selected=game;focusBackdrop(game);screen="detail";frame("GAME DETAILS");ScrollView scroll=new ScrollView(activity);LinearLayout content=column();scroll.addView(content);body.addView(scroll);View tile=cover(game);content.addView(tile,new LinearLayout.LayoutParams(-1,dp(shortScreen()?110:180)));add(content,text(game.optString("name"),27,INK));add(content,text(GameStore.system(game.optString("core"))+"  ·  "+android.text.format.Formatter.formatShortFileSize(activity,game.optLong("bytes")),14,MUTED));
        Button play=button("▶ Play game",()->activity.play(game));play.setTextColor(BG);StateListDrawable playBackground=new StateListDrawable();GradientDrawable focusedPlay=shape(ACCENT,false);focusedPlay.setStroke(dp(3),INK);playBackground.addState(new int[]{android.R.attr.state_focused},focusedPlay);playBackground.addState(new int[]{},shape(ACCENT,false));play.setBackground(playBackground);add(content,play);
        if("nes".equals(game.optString("core")))add(content,button("Play co-op · Boogie Woogie",()->activity.playCoop(game)));
        add(content,button(game.optBoolean("favorite")?"★ Remove favorite":"☆ Add to favorites",()->{try{game.put("favorite",!game.optBoolean("favorite"));store.save();detail(game);}catch(Exception ignored){}}));
        add(content,button(CoverImages.exists(activity,game.optString("id"))?"Change cover image":"Choose cover image",()->activity.chooseCover(game)));
        if(CoverImages.exists(activity,game.optString("id")))add(content,button("Remove cover image",()->{CoverImages.remove(activity,game.optString("id"));coverChanged(game.optString("id"));}));
        add(content,button(game.has("bios")?"Change BIOS · "+game.optString("bios"):"Choose BIOS (if required)",()->activity.chooseBios(game)));
        add(content,text("Save or export progress in the player before leaving. Saves stay on this device; export backups before deleting app data or moving devices.",14,MUTED));
        add(content,button("Remove from library",()->{AlertDialog dialog=new AlertDialog.Builder(activity).setTitle("Remove imported game?").setMessage("Remove this app’s game copy and optional BIOS. Your original files and exported saves stay where they are. Export any progress you want to keep first.").setNegativeButton("Keep",null).setPositiveButton("Remove",(d,w)->{store.remove(game);coverEpoch++;pendingCovers.clear();coverCache.remove(game.optString("id"));backdropId="";backdropArt=null;screen="library";show();}).create();dialog(dialog);dialog.show();}));
        add(content,button("Back to library",()->{screen="library";show();}));play.requestFocus();
    }
    private void toggle(LinearLayout parent,String label,String key,boolean fallback,Runnable changed){Switch control=new Switch(activity);control.setText(label);control.setTextColor(INK);control.setTextSize(16);control.setMinHeight(dp(52));control.setPadding(dp(8),dp(4),dp(8),dp(4));control.setBackground(background());control.setChecked(prefs.getBoolean(key,fallback));control.setOnCheckedChangeListener((view,value)->{prefs.edit().putBoolean(key,value).apply();changed.run();});add(parent,control);}
    private void coop(){
        screen="coop";frame("BOOGIE WOOGIE");ScrollView scroll=new ScrollView(activity);LinearLayout content=column();scroll.addView(content);body.addView(scroll);
        add(content,text("Same game. Together.",28,INK));
        add(content,text("Play together on your LAN. Choose an imported NES game in Library and select Play co-op, or open Boogie Woogie to join a host.",16,MUTED));
        Button launch=button("Open Boogie Woogie · LAN co-op",activity::openCoop);add(content,launch);
        add(content,text("Share Player 1, play as Player 2, or watch as a spectator. Hosting currently supports NES games. Pair with the same broker and approve each guest before playing. No RomM account is required for local games.",14,MUTED));
        add(content,text("Your game is copied privately for hosting. Original files stay in your library. The standalone Boogie Woogie app keeps separate pairing and saves.",13,MUTED));launch.requestFocus();
    }
    private void settings(){
        screen="settings";frame("SETTINGS");ScrollView scroll=new ScrollView(activity);LinearLayout content=column();scroll.addView(content);body.addView(scroll);
        add(content,button("Appearance · background and dimming",this::appearance));add(content,button("Boogie Woogie · LAN co-op",activity::openCoop));add(content,text("LAN co-op: share Player 1, play as Player 2, or watch. NES hosting is currently supported.",14,MUTED));add(content,text("Handheld & controller",25,INK));toggle(content,"Swap A/B menu actions","swap",false,()->{readControls();hint.setText(controllerHint());});toggle(content,"Left stick navigates menus","sticks",true,this::readControls);toggle(content,"Compact cards for small screens","compact",false,()->{});toggle(content,"Lock landscape for handheld play","landscape",false,this::orientation);
        add(content,text("Stick dead zone (native menus only)",15,MUTED));TextView value=text(prefs.getInt("deadzone",30)+"%",14,ACCENT);add(content,value);SeekBar zone=new SeekBar(activity);zone.setMin(15);zone.setMax(75);zone.setProgress(prefs.getInt("deadzone",30));zone.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onStartTrackingTouch(SeekBar v){}public void onStopTrackingTouch(SeekBar v){}public void onProgressChanged(SeekBar v,int progress,boolean user){prefs.edit().putInt("deadzone",progress).apply();value.setText(progress+"%");readControls();}});add(content,zone);
        add(content,button("Controller check",this::controllerCheck));add(content,text("D-pad / left stick: move focus\nA: open · B: back (or swap above)\nX: search · Y: recent games\nLB / RB: Library, Recent, Co-op, Settings\n\nThese mappings control native menus. The first connected gamepad is forwarded to EmulatorJS. Map game buttons in the player’s Control Settings; connect USB or Bluetooth controllers through Android settings.",15,MUTED));
        add(content,text("Your local library",24,INK));add(content,text(store.all().size()+" imported game(s). No account, login or server is needed. The EmulatorJS 4.2.3 runtime is included. Original game files are never uploaded.",15,MUTED));
        add(content,button("Bundled runtime license",()->{
            try(java.io.InputStream input=activity.getAssets().open("LICENSE");java.io.ByteArrayOutputStream output=new java.io.ByteArrayOutputStream()){
                byte[] buffer=new byte[8192];int count;while((count=input.read(buffer))!=-1)output.write(buffer,0,count);
                ScrollView licenseScroll=new ScrollView(activity);TextView license=text("EmulatorJS 4.2.3 · bundled upstream runtime. Emulator core licenses and source references are included in the core reports. Application code: MIT.\nSource: https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3\n\n"+output.toString("UTF-8"),13,INK);licenseScroll.addView(license);
                AlertDialog notice=new AlertDialog.Builder(activity).setTitle("EmulatorJS license").setView(licenseScroll).setPositiveButton("Close",null).create();dialog(notice);notice.show();
            }catch(Exception error){activity.toast("See the source and license links in the setup guide.");}
        }));
        add(content,text("Public alpha · Android 10+\nNo ROMs, BIOS files or keys included. Use content you are authorized to access. Independent of EmulatorJS and Valve.",13,MUTED));add(content,button("Setup, source & licenses",()->activity.startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW,android.net.Uri.parse("https://emulatormayo.quentinmayo.com/getting-started")))));
    }
    private void controllerCheck(){screen="controller";frame("CONTROLLER CHECK");add(body,text("Connected input devices",24,INK));diagnostic=text("",16,ACCENT);add(body,diagnostic);refreshDevices();add(body,text("Press buttons or move the left stick/D-pad to see Android input events. B returns to settings (A if swapped). Gameplay mapping is handled by EmulatorJS.",16,MUTED));add(body,button("Back to settings",this::settings));}
    private void orientation(){activity.setRequestedOrientation(prefs.getBoolean("landscape",false)?ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE:ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);}
    private void readControls(){controls.swap=prefs.getBoolean("swap",false);controls.sticks=prefs.getBoolean("sticks",true);controls.deadZone=prefs.getInt("deadzone",30)/100f;}
    private List<String> controllers(){List<String> result=new ArrayList<>();for(int id:InputDevice.getDeviceIds()){InputDevice d=InputDevice.getDevice(id);if(d!=null&&(d.supportsSource(InputDevice.SOURCE_GAMEPAD)||d.supportsSource(InputDevice.SOURCE_JOYSTICK)))result.add(d.getName());}return result;}
    private String controllerHint(){return (controllers().isEmpty()?"Touch or connect a controller":controllers().size()+" controller(s) connected")+"  ·  "+(controls.swap?"B open · A back":"A open · B back")+"  ·  LB/RB sections";}
    private void refreshDevices(){if(hint!=null)hint.setText(controllerHint());if(screen.equals("controller")&&diagnostic!=null)diagnostic.setText(controllers().isEmpty()?"No controller detected. Connect using USB or Bluetooth.":android.text.TextUtils.join("\n",controllers()));}
    @Override public void onInputDeviceAdded(int id){refreshDevices();}@Override public void onInputDeviceRemoved(int id){controls.stop();refreshDevices();}@Override public void onInputDeviceChanged(int id){refreshDevices();}
    boolean key(KeyEvent event){if(screen.equals("controller")){if(event.getKeyCode()==(controls.swap?KeyEvent.KEYCODE_BUTTON_A:KeyEvent.KEYCODE_BUTTON_B)){if(event.getAction()==KeyEvent.ACTION_DOWN&&event.getRepeatCount()==0)settings();return true;}if(KeyEvent.isGamepadButton(event.getKeyCode())||event.isFromSource(InputDevice.SOURCE_DPAD)){if(event.getAction()==KeyEvent.ACTION_DOWN)diagnostic.setText("Button: "+KeyEvent.keyCodeToString(event.getKeyCode()));return true;}}return controls.key(event);}
    boolean motion(MotionEvent event){if(screen.equals("controller")&&event.isFromSource(InputDevice.SOURCE_JOYSTICK)){diagnostic.setText(String.format(Locale.ROOT,"Left stick X %.2f Y %.2f\nD-pad X %.0f Y %.0f",event.getAxisValue(MotionEvent.AXIS_X),event.getAxisValue(MotionEvent.AXIS_Y),event.getAxisValue(MotionEvent.AXIS_HAT_X),event.getAxisValue(MotionEvent.AXIS_HAT_Y)));return true;}return controls.motion(event);}
    @Override public void direction(int key){ControllerFocus.move(root,body,screen.equals("library")?grid:null,key);}
    @Override public void confirm(){View focus=ControllerFocus.ensure(root,body,screen.equals("library")?grid:null);if(focus==grid){int index=grid.getSelectedItemPosition();if(index>=0&&index<games.size()){selection=index;detail(games.get(index));}}else if(focus!=null)focus.performClick();}
    @Override public void back(){if(screen.equals("controller"))settings();else if(!screen.equals("library")){screen="library";show();}else if(!query.isEmpty()){query="";show();}else activity.quit();}
    @Override public void section(int delta){int index=(screen.equals("settings")||screen.equals("controller"))?3:screen.equals("coop")?2:section.equals("Recent")?1:0;index=Math.floorMod(index+delta,4);if(index==3)settings();else if(index==2)coop();else{section=index==0?"Library":"Recent";screen="library";show();}}
    @Override public void search(){if(!screen.equals("library")){screen="library";show();}search.setVisibility(View.VISIBLE);search.requestFocus();((InputMethodManager)activity.getSystemService(android.content.Context.INPUT_METHOD_SERVICE)).showSoftInput(search,InputMethodManager.SHOW_IMPLICIT);}
    @Override public void recent(){section="Recent";screen="library";show();}
    void dialog(AlertDialog dialog) {
        controls.stop();
        // Ignore the release of the A/B press which opened this dialog.
        // Only a press begun inside this window may activate or dismiss it.
        final boolean[] confirmPressed={false}, backPressed={false};
        dialog.setOnShowListener(d -> { dialog.getWindow().setBackgroundDrawable(appearanceBackground()); ViewGroup decor=(ViewGroup)dialog.getWindow().getDecorView(); decor.post(() -> ControllerFocus.ensure(decor,decor,dialog.getListView()!=null?dialog.getListView():dialog.getButton(AlertDialog.BUTTON_NEGATIVE))); });
        dialog.setOnKeyListener((d,key,event) -> {
            if(key>=KeyEvent.KEYCODE_DPAD_UP && key<=KeyEvent.KEYCODE_DPAD_RIGHT) {
                if(event.getAction()==KeyEvent.ACTION_DOWN) { View focus=dialog.getCurrentFocus(); if(focus instanceof SeekBar && (key==KeyEvent.KEYCODE_DPAD_LEFT||key==KeyEvent.KEYCODE_DPAD_RIGHT)) { SeekBar value=(SeekBar)focus;value.setProgress(Math.max(0,Math.min(value.getMax(),value.getProgress()+(key==KeyEvent.KEYCODE_DPAD_LEFT?-5:5)))); } else { ViewGroup decor=(ViewGroup)dialog.getWindow().getDecorView(); ControllerFocus.move(decor,decor,dialog.getListView(),key); } }
                return true;
            }
            if(key==(controls.swap?KeyEvent.KEYCODE_BUTTON_A:KeyEvent.KEYCODE_BUTTON_B)) {
                if(event.getAction()==KeyEvent.ACTION_DOWN && event.getRepeatCount()==0) backPressed[0]=true;
                else if(event.getAction()==KeyEvent.ACTION_UP) { boolean dismiss=backPressed[0]&&!event.isCanceled();backPressed[0]=false;if(dismiss)dialog.dismiss(); }
                return true;
            }
            if(key==(controls.swap?KeyEvent.KEYCODE_BUTTON_B:KeyEvent.KEYCODE_BUTTON_A)) {
                if(event.getAction()==KeyEvent.ACTION_DOWN && event.getRepeatCount()==0) confirmPressed[0]=true;
                else if(event.getAction()==KeyEvent.ACTION_UP) {
                    boolean activate=confirmPressed[0]&&!event.isCanceled();confirmPressed[0]=false;
                    View focus=dialog.getCurrentFocus();
                    if(activate&&focus!=null) {
                        if(focus instanceof ListView) { ListView list=(ListView)focus;int selected=list.getSelectedItemPosition();if(selected>=0)list.performItemClick(list.getSelectedView(),selected,list.getItemIdAtPosition(selected)); }
                        else focus.performClick();
                    }
                }
                return true;
            }
            return false;
        });
    }
    void message(String message){if(status!=null)status.setText(message);}
    void suspend(){controls.stop();}
    void stopInput(){controls.stop();}
    void close(){closed=true;coverEpoch++;pendingCovers.clear();coverWorker.shutdownNow();controls.stop();inputs.unregisterInputDeviceListener(this);}
}
