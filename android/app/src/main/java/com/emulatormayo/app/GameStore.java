package com.emulatormayo.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.OpenableColumns;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.util.*;

/** Imports are private copies; original document-provider files are never deleted. */
final class GameStore {
    static final String[] CORES = {"nes","snes","gb","gbc","gba","segaMD","segaMS","segaGG","c64","n64","psx","atari2600"};
    static final String[] SYSTEMS = {"Nintendo Entertainment System","Super Nintendo","Game Boy","Game Boy Color","Game Boy Advance","Mega Drive / Genesis","Master System","Game Gear","Commodore 64","Nintendo 64","PlayStation","Atari 2600"};
    final Context context; final SharedPreferences prefs; final File folder;
    private final List<JSONObject> entries = new ArrayList<>();
    GameStore(Context context, SharedPreferences prefs) {
        this.context=context;this.prefs=prefs;folder=new File(context.getFilesDir(),"games");folder.mkdirs();
        try { JSONArray saved=new JSONArray(prefs.getString("games","[]"));for(int i=0;i<saved.length();i++)entries.add(saved.getJSONObject(i)); } catch(Exception ignored){}
    }
    synchronized List<JSONObject> all(){return new ArrayList<>(entries);}
    synchronized JSONObject find(String id){for(JSONObject game:entries)if(game.optString("id").equals(id))return game;return null;}
    synchronized void save(){JSONArray data=new JSONArray();for(JSONObject game:entries)data.put(game);prefs.edit().putString("games",data.toString()).commit();}
    JSONObject importGame(Uri uri,String core)throws Exception{
        String id=UUID.randomUUID().toString(),name=name(uri); File destination=new File(folder,id);
        copy(uri,destination);
        JSONObject game=new JSONObject().put("id",id).put("name",name).put("core",core).put("bytes",destination.length()).put("played",0).put("favorite",false);
        synchronized(this){entries.add(game);save();}return game;
    }
    String name(Uri uri){try(android.database.Cursor cursor=context.getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)){if(cursor!=null&&cursor.moveToFirst())return cursor.getString(0);}catch(Exception ignored){}return "Imported game";}
    void bios(JSONObject game,Uri uri)throws Exception{copy(uri,new File(folder,game.getString("id")+".bios"));game.put("bios",name(uri));save();}
    synchronized void remove(JSONObject game){String id=game.optString("id");entries.remove(game);new File(folder,id).delete();new File(folder,id+".bios").delete();save();}
    File file(String id,boolean bios){if(!id.matches("[a-f0-9-]{36}")||find(id)==null)return null;File file=new File(folder,id+(bios?".bios":""));return file.isFile()?file:null;}
    static String system(String core){for(int i=0;i<CORES.length;i++)if(CORES[i].equals(core))return SYSTEMS[i];return core;}
    private void copy(Uri uri,File destination)throws Exception{
        File staging=new File(folder,destination.getName()+".import");
        try(InputStream input=context.getContentResolver().openInputStream(uri);OutputStream output=new FileOutputStream(staging)){
            if(input==null)throw new IOException();byte[] buffer=new byte[65536];int count;
            while((count=input.read(buffer))!=-1){if(folder.getUsableSpace()<32L*1024*1024)throw new IOException("Not enough storage. Free some space and retry.");output.write(buffer,0,count);}
        }catch(Exception error){staging.delete();throw error;}
        if(!staging.renameTo(destination)){staging.delete();throw new IOException("Could not keep this file. Retry the import.");}
    }
}
